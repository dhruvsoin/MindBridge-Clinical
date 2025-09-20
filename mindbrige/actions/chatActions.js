"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";
import { pusherServer } from "@/lib/pusher";
import Pusher from "pusher";

export async function sendMessage(
  chatId,
  message,
  senderId,
  senderName,
  senderType
) {
  try {
    await connectDB();

    // Save message to database
    const newMessage = await Message.create({
      chatId,
      senderId,
      senderType,
      senderName,
      message,
      messageType: "text",
    });

    console.log("Message saved to DB:", newMessage);

    // Send via Pusher - THIS IS KEY!
    await pusherServer.trigger(`chat-${chatId}`, "new-message", {
      _id: newMessage._id.toString(),
      chatId: newMessage.chatId,
      senderId: newMessage.senderId,
      senderType: newMessage.senderType,
      senderName: newMessage.senderName,
      message: newMessage.message,
      createdAt: newMessage.createdAt,
    });

    console.log("Message sent via Pusher to channel:", `chat-${chatId}`);

    return JSON.parse(JSON.stringify(newMessage));
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function createOrGetChat(appointmentId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await connectDB();

    // Get appointment details
    const appointment = await Appointment.findById(appointmentId).populate(
      "doctor patient"
    );

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Check if doctor or patient data is missing
    if (!appointment.doctor || !appointment.patient) {
      throw new Error("Appointment has missing doctor or patient information");
    }

    // Check if user has access to this appointment
    const hasAccess =
      appointment.doctor.userId === userId ||
      appointment.patient.userId === userId;

    if (!hasAccess) {
      throw new Error("Unauthorized access");
    }

    // Check if appointment is confirmed
    if (appointment.status !== "confirmed") {
      throw new Error("Chat only available for confirmed appointments");
    }

    // Check if chat already exists
    let chat = await Chat.findOne({ appointmentId });

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        appointmentId,
        doctorId: appointment.doctor._id,
        patientId: appointment.patient._id,
      });
    }

    return JSON.parse(JSON.stringify(chat));
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    throw error;
  }
}

export async function getChatMessages(chatId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await connectDB();

    // Verify access to chat
    const chat = await Chat.findById(chatId).populate("doctorId patientId");

    if (!chat) {
      throw new Error("Chat not found");
    }

    const hasAccess =
      chat.doctorId.userId === userId || chat.patientId.userId === userId;

    if (!hasAccess) {
      throw new Error("Unauthorized access");
    }

    // Get messages
    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(100);

    return JSON.parse(JSON.stringify(messages));
  } catch (error) {
    console.error("Error getting chat messages:", error);
    throw error;
  }
}
