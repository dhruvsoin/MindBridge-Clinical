"use client";

import {
  Calendar,
  DollarSign,
  Star,
  Clock,
  User,
  CreditCard,
  MessageCircle,
  Activity,
  Heart,
  Brain,
  Shield,
  Eye,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BookAppointmentModal from "./BookAppointmentModal";
import ChatModal from "./ChatModal";
import { getPatientAppointments } from "@/actions/appointmentActions";
import { UserButton } from "@clerk/nextjs";

// --- Reusable Sidebar Item Component ---
const SidebarItem = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-left transition-all duration-200 ${
      isActive
        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
        : "text-slate-600 hover:bg-orange-100 hover:text-orange-700"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default function StudentDashboard({ doctors }) {
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState("find-counselors");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointmentForChat, setSelectedAppointmentForChat] =
    useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "my-appointments") {
      setActiveView("my-appointments");
    } else {
      setActiveView("find-counselors");
    }
  }, [searchParams]);

  const fetchAppointments = async () => {
    try {
      const data = await getPatientAppointments(); // Logic remains, 'patient' is a user role
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const handleOpenChat = (appointment) => {
    setSelectedAppointmentForChat(appointment);
    setIsChatModalOpen(true);
  };

  const doctorsByCategory = doctors.reduce((acc, doctor) => {
    if (!acc[doctor.category]) acc[doctor.category] = [];
    acc[doctor.category].push(doctor);
    return acc;
  }, {});

  const categories = ["all", ...Object.keys(doctorsByCategory)];
  const filteredDoctors =
    selectedCategory === "all"
      ? doctors
      : doctorsByCategory[selectedCategory] || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "confirmed":
      case "completed":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "academic":
        return <Brain className="h-4 w-4" />;
      case "career":
        return <Zap className="h-4 w-4" />;
      case "personal":
        return <Heart className="h-4 w-4" />;
      case "general":
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/50">
      <div className="flex">
        {/* --- Sidebar --- */}
        <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/80 p-6 min-h-screen flex flex-col justify-between sticky top-0">
          <div>
            <div className="flex items-center space-x-3 mb-10">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Zap className="h-7 w-7 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            </div>
            <nav className="space-y-3">
              <SidebarItem
                icon={<Calendar className="h-5 w-5" />}
                label="Find Counselors"
                isActive={activeView === "find-counselors"}
                onClick={() => setActiveView("find-counselors")}
              />
              <SidebarItem
                icon={<User className="h-5 w-5" />}
                label="My Appointments"
                isActive={activeView === "my-appointments"}
                onClick={() => setActiveView("my-appointments")}
              />
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
            <span className="text-gray-700 font-medium">My Account</span>
          </div>
        </aside>

        {/* --- Main Content --- */}
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Student Portal
                </h1>
                <p className="text-gray-500 mt-1 text-base">
                  Your space for managing appointments and academic wellbeing.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/health"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Heart className="h-4 w-4 mr-2 text-orange-500" />
                  <span>Wellness Score</span>
                </Link>
                <Link
                  href="/chatbot"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2 text-orange-500" />
                  <span>AI Assistant</span>
                </Link>
              </div>
            </div>

            {/* --- Conditional Content Rendering --- */}
            {activeView === "find-counselors" && (
              <div className="space-y-8">
                <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl overflow-hidden">
                  <div className="p-6 pb-4">
                    <h2 className="text-slate-800 flex items-center space-x-2 text-xl font-semibold">
                      <Shield className="h-5 w-5 text-orange-500" />
                      <span>Filter by Specialization</span>
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Choose from our specialized counseling categories
                    </p>
                  </div>
                  <div className="p-6 pt-0">
                    <div className="flex flex-wrap gap-3">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`capitalize transition-all duration-300 rounded-xl px-4 py-2 font-medium border text-sm ${
                            selectedCategory === category
                              ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-500/20"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="flex items-center space-x-2">
                            {category !== "all" && getCategoryIcon(category)}
                            <span>
                              {category === "all" ? "All Counselors" : category}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <div
                        key={doctor._id}
                        className="group bg-white border border-gray-200 hover:border-orange-400/40 shadow-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-500 rounded-2xl overflow-hidden flex flex-col"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h2 className="text-xl font-semibold text-slate-900 group-hover:text-orange-700 transition-colors duration-300">
                                {doctor.name}
                              </h2>
                              <p className="text-md font-medium text-orange-600 mt-1">
                                {doctor.specialization}
                              </p>
                            </div>
                            <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                              {doctor.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 pt-0 space-y-4 flex flex-col flex-grow">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2 text-gray-500">
                              <div className="p-1.5 bg-orange-100 rounded-lg">
                                <Star className="h-3 w-3 text-orange-600" />
                              </div>
                              <span>{doctor.experience} years</span>
                              <div className="p-1.5 bg-orange-100 rounded-lg">
                                <DollarSign className="h-3 w-3 text-orange-600" />
                              </div>
                              <span>₹{doctor.consultationFee}</span>
                            </div>
                          </div>
                          {doctor.qualifications?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Qualifications:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {doctor.qualifications
                                  .slice(0, 2)
                                  .map((qual, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-gray-100 text-gray-700 border-gray-200 font-semibold px-2 py-0.5 rounded-full"
                                    >
                                      {qual}
                                    </span>
                                  ))}
                                {doctor.qualifications.length > 2 && (
                                  <span className="text-xs bg-gray-100 text-gray-700 border-gray-200 font-semibold px-2 py-0.5 rounded-full">
                                    +{doctor.qualifications.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          <button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 shadow-md hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-[1.02] rounded-xl py-3 font-medium text-base inline-flex items-center justify-center mt-auto"
                            onClick={() => handleBookAppointment(doctor)}
                          >
                            <Calendar className="h-5 w-5 mr-2" />
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl">
                        <div className="text-center p-6 py-16">
                          <p className="text-gray-500">
                            No counselors found for this category.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === "my-appointments" && (
              <div className="space-y-8">
                {loading ? (
                  <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl">
                    <div className="text-center p-6 py-12">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse delay-150"></div>
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse delay-300"></div>
                      </div>
                      <span className="text-gray-500 text-base">
                        Loading appointments...
                      </span>
                    </div>
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="bg-white border border-gray-200/60 hover:border-orange-400/40 shadow-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-500 rounded-2xl overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h2 className="text-lg font-semibold text-slate-800">
                                {appointment.doctor?.name ||
                                  "Counselor not available"}
                              </h2>
                              <p className="text-orange-600 text-sm">
                                {appointment.doctor?.specialization || "N/A"}
                              </p>
                            </div>
                            <span
                              className={`${getStatusColor(
                                appointment?.status || 'pending'
                              )} border font-medium text-xs px-2.5 py-0.5 rounded-full capitalize`}
                            >
                              {appointment?.status || 'pending'}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 pt-0 space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="p-1.5 bg-orange-100 rounded-lg mr-3">
                                <Calendar className="h-3 w-3 text-orange-600" />
                              </div>
                              <span>
                                {new Date(
                                  appointment.appointmentDate
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <div className="p-1.5 bg-orange-100 rounded-lg mr-3">
                                <Clock className="h-3 w-3 text-orange-600" />
                              </div>
                              <span>
                                {new Date(
                                  appointment.appointmentDate
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          {appointment.paymentId && appointment.amount && (
                            <div className="flex items-center justify-between text-sm bg-teal-100 rounded-xl p-3 border border-teal-200">
                              <div className="flex items-center text-teal-800">
                                <CreditCard className="h-4 w-4 mr-2" />
                                <span>Payment: ₹{appointment.amount}</span>
                              </div>
                              <span className="bg-teal-200 text-teal-800 border-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                Paid
                              </span>
                            </div>
                          )}
                          {appointment.reason && (
                            <div className="text-sm bg-gray-100 rounded-xl p-3">
                              <span className="font-medium text-gray-800">
                                Reason:{" "}
                              </span>
                              <span className="text-gray-600">
                                {appointment.reason}
                              </span>
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="text-sm bg-gray-100 rounded-xl p-3">
                              <span className="font-medium text-gray-800">
                                Counselor's Notes:{" "}
                              </span>
                              <span className="text-gray-600">
                                {appointment.notes}
                              </span>
                            </div>
                          )}
                          {appointment?.status === "confirmed" &&
                            appointment.doctor && (
                              <div className="pt-2">
                                <button
                                  onClick={() => handleOpenChat(appointment)}
                                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-300 rounded-xl h-9 px-3 inline-flex items-center justify-center text-sm"
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Chat with Counselor
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl">
                    <div className="p-6 text-center py-16">
                      <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-6">
                        <User className="h-12 w-12 text-gray-400 mx-auto" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        No Appointments Yet
                      </h3>
                      <p className="text-gray-500 mb-8">
                        Find a counselor and book your first appointment.
                      </p>
                      <button
                        onClick={() => setActiveView("find-counselors")}
                        className="bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 shadow-md hover:shadow-orange-500/20 transition-all duration-300 rounded-xl px-6 py-2.5 inline-flex items-center justify-center"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Find a Counselor
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- Modals --- */}
      {selectedDoctor && (
        <BookAppointmentModal
          doctor={selectedDoctor}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedDoctor(null);
            fetchAppointments();
          }}
          onViewAppointments={() => {
            setActiveView("my-appointments");
            setIsBookingModalOpen(false);
            setSelectedDoctor(null);
            fetchAppointments();
          }}
        />
      )}
      {selectedAppointmentForChat && (
        <ChatModal
          appointment={selectedAppointmentForChat}
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedAppointmentForChat(null);
          }}
        />
      )}
    </div>
  );
}