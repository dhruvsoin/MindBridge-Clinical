import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import Doctor from "@/models/Doctor";
import PatientDashboard from "@/components/PatientDashboard";

export default async function PatientPage() {
  const { userId, sessionClaims } = await auth();

  // If auth hasn't resolved yet, optionally show nothing or a loader
  if (!userId) {
    console.log("user id not there",userId)
  }


  // Only redirect if role is present and not patient
  if (sessionClaims?.role?.role && sessionClaims.role.role !== 'patient') {
    redirect('/');
  }

  await connectDB();
  const doctors = await Doctor.find({ status: 'approved' }).lean();

  return <PatientDashboard doctors={JSON.parse(JSON.stringify(doctors))} />;
}
