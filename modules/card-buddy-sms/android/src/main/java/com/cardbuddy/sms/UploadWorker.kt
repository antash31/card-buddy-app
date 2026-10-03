package com.cardbuddy.sms
import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.work.*
import org.json.JSONObject
import org.json.JSONArray
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit

class UploadWorker(context:Context,params:WorkerParameters):Worker(context,params) {
  override fun doWork():Result = synchronized(sessionLock) {
    if(applicationContext.checkSelfPermission(Manifest.permission.RECEIVE_SMS)!=PackageManager.PERMISSION_GRANTED){val current=TrackingStore.read(applicationContext);current.put("enabled",false).put("queue",JSONArray());TrackingStore.write(applicationContext,current);return@synchronized Result.success()}
    val state=TrackingStore.read(applicationContext)
    if(!state.optBoolean("enabled"))return@synchronized Result.success()
    val queue=state.optJSONArray("queue")?:JSONArray()
    if(queue.length()==0)return@synchronized Result.success()
    try {
      val batch=JSONArray();for(i in 0 until minOf(queue.length(),50))batch.put(queue.get(i))
      var result=request(state,"/spend-events/sms/batch",JSONObject().put("events",batch),true)
      if(result.first==401){refresh(applicationContext,state);result=request(state,"/spend-events/sms/batch",JSONObject().put("events",batch),true)}
      if(result.first in 200..299) {
        synchronized(TrackingStore.lock) {
          val current=TrackingStore.read(applicationContext)
          val latest=current.optJSONArray("queue")?:JSONArray()
          val uploaded=(0 until batch.length()).map { batch.getJSONObject(it).getString("sourceFingerprint") }.toSet()
          val remaining=JSONArray()
          for(i in 0 until latest.length())if(latest.getJSONObject(i).getString("sourceFingerprint") !in uploaded)remaining.put(latest.get(i))
          current.put("queue",remaining).put("lastSyncAt",java.time.Instant.now().toString()).remove("error")
          TrackingStore.write(applicationContext,current)
          if(remaining.length()>0) Result.retry() else Result.success()
        }
      } else if(result.first==401||result.first==403){markError(applicationContext,"sign_in_required");Result.retry()}
      else if(result.first in 400..499 && result.first!=429){markError(applicationContext,"upload_rejected");Result.failure()}
      else Result.retry()
    }catch(_:Exception){Result.retry()}
  }
  companion object {
    val sessionLock = Any()
    const val NAME="cardbuddy-sms-upload"
    private fun markError(context:Context,error:String) = synchronized(TrackingStore.lock) {
      val current=TrackingStore.read(context);current.put("error",error);TrackingStore.write(context,current)
    }
    fun schedule(context:Context) {
      val work=OneTimeWorkRequestBuilder<UploadWorker>().setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL,30,TimeUnit.SECONDS).build()
      WorkManager.getInstance(context).enqueueUniqueWork(NAME,ExistingWorkPolicy.APPEND_OR_REPLACE,work)
    }
    fun request(state:JSONObject,path:String,body:JSONObject,authenticated:Boolean):Pair<Int,JSONObject?> {
      val connection=URL(state.getString("apiUrl").trimEnd('/')+path).openConnection() as HttpURLConnection
      connection.requestMethod="POST";connection.connectTimeout=15000;connection.readTimeout=20000;connection.instanceFollowRedirects=false
      connection.setRequestProperty("Content-Type","application/json")
      if(authenticated)connection.setRequestProperty("Authorization","Bearer ${state.getString("accessToken")}")
      connection.doOutput=true
      try {
        connection.outputStream.use{it.write(body.toString().toByteArray())}
        val code=connection.responseCode
        val raw=(if(code in 200..299)connection.inputStream else connection.errorStream)?.bufferedReader()?.use{it.readText()}
        return code to if(raw.isNullOrBlank())null else JSONObject(raw)
      } finally {connection.disconnect()}
    }
    // Shared lock coordinates foreground refresh, WorkManager, logout and account switch.
    fun refresh(context:Context,state:JSONObject):JSONObject {
      val result=request(state,"/auth/refresh",JSONObject().put("refreshToken",state.getString("refreshToken")),false)
      if(result.first !in 200..299)throw IllegalStateException("Session expired")
      val data=result.second!!.getJSONObject("data")
      if(data.getJSONObject("user").getString("id")!=state.getString("userId")){TrackingStore.clear(context);throw IllegalStateException("Session owner changed")}
      val session=data.getJSONObject("session")
      state.put("accessToken",session.getString("accessToken")).put("refreshToken",session.getString("refreshToken"))
      synchronized(TrackingStore.lock) {
        val current=TrackingStore.read(context)
        require(current.optString("userId")==state.getString("userId")){"Session owner changed"}
        current.put("accessToken",session.getString("accessToken")).put("refreshToken",session.getString("refreshToken"))
        TrackingStore.write(context,current)
      }
      return session
    }
  }
}
