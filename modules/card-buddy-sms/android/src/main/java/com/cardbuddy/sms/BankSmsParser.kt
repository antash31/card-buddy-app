package com.cardbuddy.sms

import org.json.JSONObject
import java.security.MessageDigest
import java.time.Instant
import java.time.LocalDateTime
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

object BankSmsParser {
  private fun match(pattern: String, text: String) = Regex(pattern, RegexOption.IGNORE_CASE).find(text)
  fun candidate(body: String, sender: String): Boolean =
    match("\\botp\\b|one[ -]time|verification code|password|login code", body) == null &&
    match("hdfc|\\bsbi\\b|state bank|axis|american express|\\bamex\\b", "$sender $body") != null &&
    match("spent|debited|credited|refund|revers|declin|withdraw|payment|transfer", body) != null &&
    match("(?:INR|Rs\\.?|₹)\\s*\\d", body) != null

  fun parse(raw: String, sender: String, receivedMillis: Long): JSONObject? {
    val body = raw.replace(Regex("\\s+"), " ").trim()
    if (!candidate(body, sender)) return null
    val amount = match("(?:INR|Rs\\.?|₹)\\s*([\\d,]+)(?:\\.(\\d{1,2}))?", body) ?: return null
    val whole = amount.groupValues[1].replace(",", "").toLongOrNull() ?: return null
    if (whole > 1_000_000_000L) return null
    val minor = whole * 100 + amount.groupValues[2].padEnd(2, '0').toLong()
    if (minor <= 0 || minor > 100_000_000_000L) return null
    // Unrecognized banks stay null rather than defaulting to SBI/HDFC — an unmatched issuer
    // routes to review instead of silently mislabeling someone else's bank.
    val issuer = when {
      match("hdfc", "$sender $body") != null -> "HDFC"
      match("\\bsbi\\b|state bank of india", "$sender $body") != null -> "SBI"
      match("axis", "$sender $body") != null -> "Axis Bank"
      match("american express|\\bamex\\b", "$sender $body") != null -> "AMEX"
      else -> null
    }
    val suffix = match("(?:credit\\s+|debit\\s+)?card(?:\\s+(?:no\\.?|ending(?:\\s+in)?))?\\s*[:.-]?\\s*[xX*]*(\\d{4})(?!\\d)", body)?.groupValues?.get(1)
    val type = when {
      match("refund",body) != null -> "refund"
      match("revers",body) != null -> "reversal"
      match("bill\\s*pay|payment\\s+(?:received|towards|of.*credit card)|credit card payment",body) != null -> "bill_payment"
      match("transfer|\\bNEFT\\b|\\bIMPS\\b|\\bRTGS\\b",body) != null -> "transfer"
      match("cashback",body) != null -> "cashback"
      match("withdraw|\\bATM\\b",body) != null -> "cash_withdrawal"
      match("spent|purchase|(?:debited.*(?:at|card))|(?:card.*debited)",body) != null -> "purchase"
      else -> "unknown"
    }
    val status = when {
      match("declin|failed|unsuccessful",body) != null -> "declined"
      match("pending|authori[sz](?:ation|ed)|hold placed",body) != null -> "pending"
      type == "reversal" -> "reversed"
      else -> "posted"
    }
    val dateMatch = match("\\b(20\\d{2}-\\d{2}-\\d{2})[: T](\\d{2}:\\d{2}:\\d{2})",body)
    val shortDate = match("\\bon\\s+(\\d{2})/(\\d{2})/(\\d{2}|20\\d{2})(?!\\d)",body)
    val occurred = try {
      if (dateMatch != null) LocalDateTime.parse("${dateMatch.groupValues[1]}T${dateMatch.groupValues[2]}").toInstant(ZoneOffset.ofHoursMinutes(5,30)).toString()
      else if (shortDate != null) {
        val g=shortDate.groupValues;val year=if(g[3].length==2) "20${g[3]}" else g[3]
        LocalDate.parse("$year-${g[2]}-${g[1]}",DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay().toInstant(ZoneOffset.ofHoursMinutes(5,30)).toString()
      } else Instant.ofEpochMilli(receivedMillis).toString()
    } catch (_: Exception) { null }
    val merchant = if (type in listOf("purchase","refund","reversal")) match("\\bat\\s+(.+?)(?=\\s+on\\s+|\\.\\s*Not You|\\s+Avl\\b|$)",body)?.groupValues?.get(1)
      ?.replace(Regex("(?:\\d[ -]?){7,}"),"[redacted]")?.replace(Regex("\\S+@\\S+|https?://\\S+"),"[redacted]")?.replace(Regex("[\\x00-\\x1f<>]")," ")?.trim()?.take(120) else null
    val code = when(merchant?.uppercase()) { "ZOMATO" -> "zomato";"ASSPL" -> "amazon_in";else -> null }
    val fingerprint = MessageDigest.getInstance("SHA-256").digest("$sender|$body|${occurred ?: ""}".toByteArray()).joinToString("") { "%02x".format(it) }
    return JSONObject().apply {
      put("source","android_sms");put("sourceFingerprint",fingerprint);put("sourceEventId",JSONObject.NULL)
      put("issuer",issuer ?: JSONObject.NULL);put("cardLast4",suffix ?: JSONObject.NULL);put("amountMinor",minor);put("currency","INR")
      put("direction",if(match("credited|refund|revers|cashback",body)!=null) "credit" else "debit")
      put("eventType",type);put("transactionStatus",status);put("occurredAt",occurred ?: JSONObject.NULL)
      put("merchantRaw",merchant ?: JSONObject.NULL);put("merchantCode",code ?: JSONObject.NULL)
      put("categoryCode",if(code=="zomato") "food_delivery" else JSONObject.NULL);put("channelCode",JSONObject.NULL)
      put("parserVersion","bank-alerts/1.1.0");put("parseConfidence",if(type=="unknown") 0.4 else if(code=="zomato") 0.98 else if(code=="amazon_in") 0.7 else 0.85)
      put("userCardId",JSONObject.NULL);put("processingState","needs_review")
    }
  }
}
