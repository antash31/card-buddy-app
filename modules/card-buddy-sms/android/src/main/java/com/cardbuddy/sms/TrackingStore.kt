package com.cardbuddy.sms

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.AtomicFile
import android.util.Base64
import org.json.JSONObject
import org.json.JSONArray
import java.io.File
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

object TrackingStore {
  val lock = Any()
  private const val ALIAS="cardbuddy.sms.outbox.v1"
  private fun key(): SecretKey {
    val store=KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    return (store.getKey(ALIAS,null) as? SecretKey) ?: KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore").apply {
      init(KeyGenParameterSpec.Builder(ALIAS,KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build())
    }.generateKey()
  }
  private fun file(context: Context)=AtomicFile(File(context.noBackupFilesDir,"tracking-outbox.enc"))
  fun read(context: Context): JSONObject = synchronized(lock) {
    if(!file(context).baseFile.exists()) return@synchronized JSONObject()
    try {
      val bytes=file(context).readFully();val cipher=Cipher.getInstance("AES/GCM/NoPadding")
      cipher.init(Cipher.DECRYPT_MODE,key(),GCMParameterSpec(128,bytes.copyOfRange(0,12)))
      JSONObject(String(cipher.doFinal(bytes.copyOfRange(12,bytes.size)),Charsets.UTF_8))
    } catch (_: Exception) { file(context).delete();JSONObject() }
  }
  fun write(context: Context,data: JSONObject) = synchronized(lock) {
    val cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key())
    val bytes=cipher.iv+cipher.doFinal(data.toString().toByteArray(Charsets.UTF_8))
    val target=file(context);val output=target.startWrite()
    try { output.write(bytes);target.finishWrite(output) } catch(e:Exception){target.failWrite(output);throw e}
  }
  fun clear(context: Context) = synchronized(lock) { file(context).delete() }
  fun enqueue(context: Context,event: JSONObject) = synchronized(lock) {
    val state=read(context);if(!state.optBoolean("enabled"))return@synchronized
    val queue=state.optJSONArray("queue")?:JSONArray()
    if((0 until queue.length()).any { queue.getJSONObject(it).optString("sourceFingerprint")==event.optString("sourceFingerprint") })return@synchronized
    // Fail closed at a finite queue bound; surface it instead of dropping silently.
    if(queue.length()>=10000){state.put("error","queue_full");write(context,state);return@synchronized}
    queue.put(event);state.put("queue",queue);write(context,state)
  }
}
