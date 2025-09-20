"use server";

import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Doctor from "@/models/Doctor";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createPaymentOrder(doctorId) {
  try {

    await connectDB();
    
    // Get doctor details for payment amount
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: doctor.consultationFee * 100, // Amount in paise
      currency: "INR",
      receipt: `appointment_${Date.now()}`,
      notes: {
        doctorId: doctorId,
        userId: userId,
        doctorName: doctor.name,
      }
    });

    console.log("Created payment order:", order);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      doctorFee: doctor.consultationFee
    };

  } catch (error) {
    console.error("Error creating payment order:", error);
    throw error;
  }
}

export async function verifyPayment(paymentData) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    console.log("Verifying payment with data:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature?.substring(0, 10) + "..." // Log partial signature for security
    });

    // Check if all required fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing payment verification fields:", {
        has_order_id: !!razorpay_order_id,
        has_payment_id: !!razorpay_payment_id,
        has_signature: !!razorpay_signature
      });
      throw new Error("Missing required payment verification fields");
    }

    // Check if environment variables are present
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET environment variable is missing");
      throw new Error("Payment verification configuration error");
    }

    // Verify the payment signature using Razorpay SDK
    const crypto = require("crypto");
    
    // Create the signature string as per Razorpay documentation
    const signatureString = razorpay_order_id + "|" + razorpay_payment_id;
    
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(signatureString);
    const generated_signature = hmac.digest("hex");

    const isSignatureValid = generated_signature === razorpay_signature;
    
    console.log("Signature validation result:", isSignatureValid);

    if (isSignatureValid) {
      console.log("Payment verification successful for payment ID:", razorpay_payment_id);
      return { success: true, paymentId: razorpay_payment_id };
    } else {
      console.error("Signature mismatch - payment verification failed");
      console.error("Expected signature:", generated_signature);
      console.error("Received signature:", razorpay_signature);
      throw new Error("Payment signature verification failed");
    }
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    throw error;
  }
}
