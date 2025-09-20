"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";

export async function setUserRole(role) {
  try {
    console.log(role);
    const { userId } = await auth(); 
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    });

    await connectDB();

    if (role === "patient") {
      // Create patient profile if doesn't exist
      const existingPatient = await Patient.findOne({ userId });
      
      if (!existingPatient) {
        // Get user details from Clerk
        const user = await client.users.getUser(userId);
        
        await Patient.create({
          userId,
          name: user.fullName || `${user.firstName} ${user.lastName}`,
          email: user.emailAddresses[0]?.emailAddress,
          gender: user.publicMetadata?.gender || "other"
        });
      }
    } else if (role === "doctor") {
      // Check if doctor profile exists
      const existingDoctor = await Doctor.findOne({ userId });
      
      if (!existingDoctor) {
        // Don't redirect here, return a flag instead
        return { needsOnboarding: true };
      }
    }

    // Return success instead of redirecting
    return { success: true, role };

  } catch (error) {
    console.error("Error setting user role:", error);
    throw error;
  }
}
