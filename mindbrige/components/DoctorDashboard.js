"use client";

import {
    Calendar, Clock, User, MessageCircle, AlertCircle, FileText, Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getDoctorAppointments,
    updateAppointmentStatus,
} from "@/actions/appointmentActions";
import ChatModal from "./ChatModal";
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

export default function CounselorDashboard({ doctor }) {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingAppointment, setUpdatingAppointment] = useState(null);
    const [activeView, setActiveView] = useState("appointments");

    // Chat states
    const [selectedAppointmentForChat, setSelectedAppointmentForChat] = useState(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);

    useEffect(() => {
        if (doctor && doctor.status === "approved") {
            fetchAppointments();
        }
    }, [doctor?.status]);

    const fetchAppointments = async () => {
        try {
            const data = await getDoctorAppointments(); // Backend action name remains unchanged
            setAppointments(
                data.map((apt) => ({ ...apt, originalNotes: apt.notes || "" }))
            );
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appointmentId, status, notes = "") => {
        setUpdatingAppointment(appointmentId);
        try {
            await updateAppointmentStatus(appointmentId, status, notes);
            await fetchAppointments();
        } catch (error) {
            console.error("Error updating appointment:", error);
        } finally {
            setUpdatingAppointment(null);
        }
    };

    const handleOpenChat = (appointment) => {
        setSelectedAppointmentForChat(appointment);
        setIsChatModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
            case "confirmed":
            case "completed": return "bg-teal-100 text-teal-800 border-teal-200";
            case "cancelled": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const todayAppointments = appointments.filter((apt) => {
        const today = new Date().toDateString();
        return new Date(apt.appointmentDate).toDateString() === today;
    });

    return (
        <div className="min-h-screen bg-orange-50/50 flex">
            {/* --- Sidebar --- */}
            <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/80 p-6 min-h-screen flex flex-col justify-between sticky top-0">
                <div>
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <Activity className="h-7 w-7 text-orange-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    </div>
                    <nav className="space-y-3">
                        <SidebarItem
                            icon={<Calendar className="h-5 w-5" />}
                            label="Appointments"
                            isActive={activeView === "appointments"}
                            onClick={() => setActiveView("appointments")}
                        />
                        <SidebarItem
                            icon={<User className="h-5 w-5" />}
                            label="Profile"
                            isActive={activeView === "profile"}
                            onClick={() => setActiveView("profile")}
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
                                Counselor Dashboard
                            </h1>
                            <p className="text-gray-500 mt-1 text-base">
                                Welcome back, {doctor.name}
                            </p>
                        </div>
                        <UserButton afterSignOutUrl="/" />
                    </div>

                    {doctor.status === "approved" ? (
                        <div className="space-y-8">
                            {/* --- Appointments View --- */}
                            {activeView === "appointments" && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="bg-white border border-gray-200/60 shadow-sm rounded-2xl">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-slate-800 flex items-center space-x-3 text-lg">
                                                    <Calendar className="h-5 w-5 text-orange-500" />
                                                    <span>Today's Appointments</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-4xl font-bold text-orange-600">{todayAppointments.length}</div>
                                                <p className="text-md text-gray-500">{todayAppointments.length === 0 ? "No appointments scheduled" : "scheduled for today"}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white border border-gray-200/60 shadow-sm rounded-2xl">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-slate-800 flex items-center space-x-3 text-lg">
                                                    <User className="h-5 w-5 text-orange-500" />
                                                    <span>Total Appointments</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-4xl font-bold text-orange-600">{appointments.length}</div>
                                                <p className="text-md text-gray-500">All time</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white border border-gray-200/60 shadow-sm rounded-2xl">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-slate-800 flex items-center space-x-3 text-lg">
                                                    <Clock className="h-5 w-5 text-orange-500" />
                                                    <span>Pending Requests</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-4xl font-bold text-orange-600">{appointments.filter(apt => apt.status === "pending").length}</div>
                                                <p className="text-md text-gray-500">Awaiting confirmation</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <Card className="bg-white border border-gray-200/60 shadow-sm rounded-2xl">
                                        <CardHeader>
                                            <CardTitle className="text-slate-800">All Appointments</CardTitle>
                                            <CardDescription className="text-gray-500">Manage your student appointments</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {loading ? (
                                                <div className="text-center py-12 text-gray-500">Loading appointments...</div>
                                            ) : appointments.length > 0 ? (
                                                <div className="space-y-6">
                                                    {appointments.map((appointment) => (
                                                        <div key={appointment._id} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <h3 className="font-semibold text-lg text-slate-800">
                                                                        {appointment.patient?.name || "Student not available"}
                                                                    </h3>
                                                                    {appointment.reason && <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Reason: </span>{appointment.reason}</p>}
                                                                </div>
                                                                <Badge className={`${getStatusColor(appointment?.status || 'pending')} border font-medium capitalize`}>{appointment?.status || 'pending'}</Badge>
                                                            </div>
                                                            <div className="flex items-center space-x-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
                                                                <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-orange-500" /><span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span></div>
                                                                <div className="flex items-center"><Clock className="h-4 w-4 mr-2 text-orange-500" /><span>{new Date(appointment.appointmentDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span></div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <Textarea placeholder="Add notes for this appointment..." value={appointment.notes || ""} onChange={(e) => setAppointments(prev => prev.map(apt => apt._id === appointment._id ? { ...apt, notes: e.target.value } : apt))} onBlur={(e) => { if (e.target.value !== appointment.originalNotes) { handleStatusUpdate(appointment._id, appointment?.status || 'pending', e.target.value); } }} rows={2} className="bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500" />
                                                                <div className="flex items-center gap-4">
                                                                    <Select value={appointment?.status || 'pending'} onValueChange={(value) => handleStatusUpdate(appointment._id, value, appointment.notes)} disabled={updatingAppointment === appointment._id}>
                                                                        <SelectTrigger className="w-full md:w-48 bg-gray-50 border-gray-300 text-gray-900"><SelectValue /></SelectTrigger>
                                                                        <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent>
                                                                    </Select>
                                                                    {appointment?.status === "confirmed" && <Button variant="outline" onClick={() => handleOpenChat(appointment)}><MessageCircle className="h-4 w-4 mr-2" />Chat</Button>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Appointments Yet</h3>
                                                    <p className="text-gray-500">New appointments from students will appear here.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* --- Profile View --- */}
                            {activeView === "profile" && (
                                <Card className="bg-white border border-gray-200/60 shadow-sm rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-slate-800 flex items-center space-x-3"><User className="h-6 w-6 text-orange-500" /><span>Profile Information</span></CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                            <div><label className="font-medium text-gray-500">Specialization</label><p className="text-base text-slate-800 mt-1">{doctor.specialization}</p></div>
                                            <div><label className="font-medium text-gray-500">Category</label><p className="text-base text-slate-800 mt-1">{doctor.category}</p></div>
                                            <div><label className="font-medium text-gray-500">Experience</label><p className="text-base text-slate-800 mt-1">{doctor.experience} years</p></div>
                                            <div><label className="font-medium text-gray-500">Consultation Fee</label><p className="text-base text-slate-800 mt-1">₹{doctor.consultationFee}</p></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <Card className="bg-white border-gray-200/60 shadow-sm rounded-2xl">
                            <CardContent className="text-center py-16">
                                <div className="mx-auto p-3 bg-amber-100 rounded-full w-fit border-4 border-amber-50 mb-4"><AlertCircle className="h-10 w-10 text-amber-500" /></div>
                                <h3 className="text-2xl font-semibold text-slate-800 mb-2">Profile Under Review</h3>
                                <p className="text-gray-500 max-w-md mx-auto">Thank you for your submission. Our team is reviewing your profile and will notify you upon approval.</p>
                            </CardContent>
                        </Card>
                    )}

                    {selectedAppointmentForChat && (
                        <ChatModal
                            appointment={selectedAppointmentForChat}
                            isOpen={isChatModalOpen}
                            onClose={() => { setIsChatModalOpen(false); setSelectedAppointmentForChat(null); }}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}