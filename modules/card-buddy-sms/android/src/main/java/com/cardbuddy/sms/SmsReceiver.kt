package com.cardbuddy.sms
import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Telephony
import java.util.concurrent.Executors
class SmsReceiver: BroadcastReceiver() {
  override fun onReceive(context:Context,intent:Intent) {
    if(intent.action!=Telephony.Sms.Intents.SMS_RECEIVED_ACTION)return
    if(context.checkSelfPermission(Manifest.permission.RECEIVE_SMS)!=PackageManager.PERMISSION_GRANTED){TrackingStore.clear(context);return}
    val pending=goAsync()
    executor.execute {
      try {
        synchronized(TrackingStore.lock) {
          if(!TrackingStore.read(context).optBoolean("enabled"))return@synchronized
          val parts=Telephony.Sms.Intents.getMessagesFromIntent(intent)
          // Android delivers assembled PDUs in one broadcast; parse the combined text once.
          val first=parts.firstOrNull()?:return@synchronized
          val event=BankSmsParser.parse(parts.joinToString(""){it.messageBody?:""},first.originatingAddress?:"",first.timestampMillis)
          if(event!=null){TrackingStore.enqueue(context,event);UploadWorker.schedule(context)}
        }
      } finally {pending.finish()}
    }
  }
  companion object { private val executor=Executors.newSingleThreadExecutor() }
}
