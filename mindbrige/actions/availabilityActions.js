"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Appointment from "@/models/Appointment";

export async function checkSlotAvailability(doctorId, appointmentDate) {
  try {
    await connectDB();

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      status: { $in: ['pending', 'confirmed'] }
    });

    return { available: !existingAppointment };
  } catch (error) {
    console.error("Error checking slot availability:", error);
    return { available: true }; // Default to available if error
  }
}
