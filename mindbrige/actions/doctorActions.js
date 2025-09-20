"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Doctor from "@/models/Doctor";

export async function createDoctorProfile(doctorData) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await connectDB();

    // Get user details from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const doctor = new Doctor({
      userId,
      name: doctorData.name,
      email: user.emailAddresses[0]?.emailAddress,
      phone: doctorData.phone,
      specialization: doctorData.specialization,
      category: doctorData.category,
      experience: doctorData.experience,
      qualifications: doctorData.qualifications,
      consultationFee: doctorData.consultationFee,
      availability: doctorData.availability,
      status: 'pending'
    });

    await doctor.save();
    
    redirect('/doctor');
  } catch (error) {
    console.error("Error creating doctor profile:", error);
    throw error;
  }
}
