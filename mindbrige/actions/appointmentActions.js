"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";

export async function createAppointment(appointmentData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await connectDB();

    // Get or create patient profile
    let patient = await Patient.findOne({ userId });
    if (!patient) {
      // Create basic patient profile if it doesn't exist
      const { clerkClient } = require("@clerk/nextjs/server");
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      
      patient = new Patient({
        userId,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User',
        email: user.emailAddresses[0]?.emailAddress || 'no-email@example.com',
      });
      await patient.save();
    }

    // Verify doctor exists and is approved
    const doctor = await Doctor.findById(appointmentData.doctorId);
    if (!doctor || doctor.status !== "approved") {
      throw new Error("Doctor not available");
    }

    // Create appointment with payment info
    const appointment = new Appointment({
      patient: patient._id,
      doctor: doctor._id,
      appointmentDate: new Date(appointmentData.appointmentDate),
      reason: appointmentData.reason,
      status: "confirmed", // Directly confirmed since payment is made
      paymentId: appointmentData.paymentId,
      amount: doctor.consultationFee,
    });

    await appointment.save();

    return { success: true, appointmentId: appointment._id.toString() };
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
}
export async function getPatientAppointments() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await connectDB();

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      console.log("Patient not found for userId:", userId);
      return [];
    }

    console.log("Found patient:", patient._id);

    const appointments = await Appointment.find({ patient: patient._id })
      .populate({
        path: "doctor",
        select: "name specialization category consultationFee userId", // Add userId here
      })
      .populate({
        path: "patient",
        select: "name email userId", // Add userId here
      })
      .sort({ appointmentDate: -1 })
      .lean();

    console.log("Found patient appointments:", appointments.length);

    // Filter out appointments where doctor was not populated (deleted doctors)
    const validAppointments = appointments.filter(
      (appointment) => appointment.doctor !== null
    );

    console.log(
      "Valid appointments after filtering:",
      validAppointments.length
    );

    return JSON.parse(JSON.stringify(validAppointments));
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return [];
  }
}

export async function getDoctorAppointments() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await connectDB();

    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      console.log("Doctor not found for userId:", userId);
      return [];
    }

    console.log("Found doctor:", doctor._id);

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate({
        path: "patient",
        select: "name email userId",
      })
      .populate({
        path: "doctor",
        select: "name specialization category consultationFee userId",
      })
      .sort({ appointmentDate: -1 })
      .lean();

    console.log("Found doctor appointments:", appointments.length);

    // Filter out appointments where patient was not populated (deleted patients)
    const validAppointments = appointments.filter(
      (appointment) => appointment.patient !== null
    );

    console.log(
      "Valid doctor appointments after filtering:",
      validAppointments.length
    );

    return JSON.parse(JSON.stringify(validAppointments));
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return [];
  }
}

export async function updateAppointmentStatus(
  appointmentId,
  status,
  notes = ""
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await connectDB();

    // Verify doctor owns this appointment
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        doctor: doctor._id,
      },
      {
        status,
        ...(notes && { notes }),
      },
      { new: true }
    );

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
}
