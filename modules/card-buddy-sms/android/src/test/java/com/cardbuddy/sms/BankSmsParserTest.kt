package com.cardbuddy.sms
import org.junit.Assert.*
import org.junit.Test
class BankSmsParserTest {
 @Test fun hdfcAsspl(){val e=BankSmsParser.parse("Spent Rs.4310.06 On HDFC Bank Card 3408 At ASSPL On 2026-09-14:03:07:29.Not You?","HDFCBK",0)!!;assertEquals(431006,e.getLong("amountMinor"));assertEquals("amazon_in",e.getString("merchantCode"));assertEquals("2026-09-13T21:37:29Z",e.getString("occurredAt"))}
 @Test fun missingDate(){val e=BankSmsParser.parse("Spent ₹1,23,456.78 on HDFC Card 3408 at ZOMATO","HDFCBK",0)!!;assertEquals(12345678,e.getLong("amountMinor"));assertEquals("1970-01-01T00:00:00Z",e.getString("occurredAt"))}
 @Test fun sbiTransfer(){val e=BankSmsParser.parse("Your A/C XXXXX526739 Credited INR 37,969.00 on 11/09/26 -Deposit by transfer from someone. Avl Bal INR 1,49,724.30-SBI","SBI",0)!!;assertEquals("transfer",e.getString("eventType"));assertTrue(e.isNull("cardLast4"));assertTrue(e.isNull("merchantRaw"))}
 @Test fun otp(){assertNull(BankSmsParser.parse("HDFC OTP 1234 for purchase INR 500","HDFCBK",0))}
 @Test fun multipart(){val parts=listOf("Spent Rs.248.59 On HDFC Bank Card 3408 ","At ZOMATO On 2026-09-11:00:09:02.");assertEquals("zomato",BankSmsParser.parse(parts.joinToString(""),"HDFCBK",0)!!.getString("merchantCode"))}
 @Test fun axisBank(){val e=BankSmsParser.parse("Spent Rs.1,250.00 on your Axis Bank Credit Card ending 4521 at MYNTRA on 15/09/26.","AXISBK",0)!!;assertEquals("Axis Bank",e.getString("issuer"));assertEquals("4521",e.getString("cardLast4"))}
 @Test fun amex(){val e=BankSmsParser.parse("You have spent INR 3,499.00 on your American Express Card ending 2001 at AMAZON on 15/09/26.","AMEX",0)!!;assertEquals("AMEX",e.getString("issuer"));assertEquals(349900L,e.getLong("amountMinor"))}
 @Test fun ambiguousBankNotDefaultedToSbi(){val e=BankSmsParser.parse("Spent Rs.500 on your State Bank Card 1234 at STORE","STATEBK",0)!!;assertTrue(e.isNull("issuer"))}
}
