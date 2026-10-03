package com.cardbuddy.sms
import android.Manifest
import android.content.pm.PackageManager
import android.content.pm.ApplicationInfo
import android.provider.Telephony
import androidx.work.WorkManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject
import org.json.JSONArray
import java.net.URI

class SmsTrackingModule:Module() {
  private val context get()=appContext.reactContext ?: throw IllegalStateException("Context unavailable")
  override fun definition()=ModuleDefinition {
    Name("CardBuddySms")
    AsyncFunction("status") {
      synchronized(TrackingStore.lock) {
        val permission=context.checkSelfPermission(Manifest.permission.RECEIVE_SMS)==PackageManager.PERMISSION_GRANTED
        if(!permission){val current=TrackingStore.read(context);current.put("enabled",false).put("queue",JSONArray());TrackingStore.write(context,current);WorkManager.getInstance(context).cancelUniqueWork(UploadWorker.NAME)}
        val s=TrackingStore.read(context)
        mapOf("enabled" to s.optBoolean("enabled"),"permissionGranted" to permission,"queued" to (s.optJSONArray("queue")?.length()?:0),"lastSyncAt" to s.optString("lastSyncAt").ifEmpty{null},"error" to s.optString("error").ifEmpty{null})
      }
    }
    AsyncFunction("enable") { userId:String,apiUrl:String,accessToken:String,refreshToken:String,historyDays:Int ->
      synchronized(UploadWorker.sessionLock) {
        require(context.checkSelfPermission(Manifest.permission.RECEIVE_SMS)==PackageManager.PERMISSION_GRANTED){"SMS permission is required"}
        require(historyDays in 0..90){"History must be at most 90 days"}
        if(historyDays>0)require(context.checkSelfPermission(Manifest.permission.READ_SMS)==PackageManager.PERMISSION_GRANTED){"History permission is required"}
        val uri=URI(apiUrl);val debug=context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0
        require(uri.scheme=="https" || (debug && uri.scheme=="http")){"Tracking requires HTTPS"}
        require(uri.userInfo==null && uri.host!=null){"Invalid API URL"}
        val old=TrackingStore.read(context)
        val same=old.optString("userId")==userId
        val state=if(same)old else JSONObject()
        state.put("userId",userId).put("apiUrl",apiUrl).put("accessToken",accessToken).put("refreshToken",refreshToken).put("enabled",true)
        if(!same)state.put("queue",JSONArray())
        TrackingStore.write(context,state)
        if(historyDays>0){
          val cutoff=System.currentTimeMillis()-historyDays*86400000L
          context.contentResolver.query(Telephony.Sms.Inbox.CONTENT_URI,arrayOf("body","address","date"),"date >= ?",arrayOf(cutoff.toString()),"date ASC")?.use { cursor ->
            while(cursor.moveToNext()) {
              val e=BankSmsParser.parse(cursor.getString(0)?:"",cursor.getString(1)?:"",cursor.getLong(2))
              if(e!=null)TrackingStore.enqueue(context,e)
            }
          }
        }
        UploadWorker.schedule(context)
      }
    }
    AsyncFunction("disable") {
      synchronized(UploadWorker.sessionLock){val s=TrackingStore.read(context);TrackingStore.clear(context);WorkManager.getInstance(context).cancelUniqueWork(UploadWorker.NAME);if(s.has("accessToken"))mapOf("accessToken" to s.getString("accessToken"),"refreshToken" to s.getString("refreshToken")) else null}
    }
    AsyncFunction("session") { userId:String ->
      synchronized(TrackingStore.lock) {
        val s=TrackingStore.read(context)
        if(s.has("accessToken") && (userId.isEmpty() || s.optString("userId")==userId)) mapOf("userId" to s.getString("userId"),"accessToken" to s.getString("accessToken"),"refreshToken" to s.getString("refreshToken")) else null
      }
    }
    AsyncFunction("refreshSession") { userId:String,failedToken:String ->
      synchronized(UploadWorker.sessionLock) {
        val s=TrackingStore.read(context)
        require(s.has("accessToken") && s.optString("userId")==userId){"Tracking session unavailable"}
        // A background worker may already have replaced the failed token.
        if(s.getString("accessToken")==failedToken)UploadWorker.refresh(context,s)
        mapOf("accessToken" to s.getString("accessToken"),"refreshToken" to s.getString("refreshToken"))
      }
    }
    AsyncFunction("flush") { UploadWorker.schedule(context) }
  }
}
