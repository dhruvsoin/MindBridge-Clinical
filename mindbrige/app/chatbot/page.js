"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    MessageCircle,
    Send,
    Bot,
    User,
    Stethoscope,
    Phone,
    Calendar,
    ArrowLeft,
    FileText
} from "lucide-react";
import BookAppointmentModal from "@/components/BookAppointmentModal";
import PDFUploaderModal from './PDFUploaderModal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ChatbotPage() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isReportsDialogOpen, setIsReportsDialogOpen] = useState(false);
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);
    const scrollAreaRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { text: input, isUser: true, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "prompt": input }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiMessage = {
                text: data.response,
                isUser: false,
                timestamp: new Date(),
                analysis: data.analysis || null,
                specialists: data.specialists || [],
                isSerious: data.is_serious || false,
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg = {
                text: `Sorry, I'm having trouble connecting. Please try again. Error: ${error.message}`,
                isUser: false,
                timestamp: new Date(),
                isError: true,
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleBookAppointment = (doctor) => {
        const doctorData = {
            _id: doctor.doctor_id,
            name: doctor.name,
            specialization: doctor.specialization,
            category: doctor.category,
            consultationFee: 500, // Default fee
            experience: doctor.experience,
            phone: doctor.phone,
            availability: [ // Default availability, should be fetched in a real app
                { day: "Monday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
                { day: "Tuesday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
                { day: "Wednesday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
                { day: "Thursday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
                { day: "Friday", slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] },
            ],
        };
        setSelectedDoctor(doctorData);
        setIsBookingModalOpen(true);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, loading]);

    return (
        <div className="fixed inset-0 z-50 bg-orange-50/50 flex flex-col">
            {/* Top Header */}
            <div className="relative z-10 flex items-center justify-between p-4 bg-white/80 backdrop-blur-lg border-b border-gray-200/80">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => router.push('/patient')}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 border border-orange-200/60 rounded-lg">
                            <Bot className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">AI Health Assistant</h1>
                            <p className="text-xs text-gray-500 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </div>
                {/* <Button disabled 
                    variant="outline" 
                    className="bg-gray-100 hover:bg-gray-200"
                    onClick={() => setIsUploaderOpen(true)}
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Reports
                </Button> */}
                <PDFUploaderModal isOpen={isUploaderOpen} onClose={() => setIsUploaderOpen(false)} />
            </div>

            {/* Chat Container */}
            <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
                {/* Messages Area */}
                <div
                    ref={scrollAreaRef}
                    className="flex-1 p-4 sm:p-6 overflow-y-auto"
                >
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center py-12 max-w-md">
                                <div className="p-5 bg-orange-100 rounded-full w-fit mx-auto mb-6 border-4 border-orange-50">
                                    <Bot className="h-12 w-12 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">
                                    AI Health Assistant
                                </h3>
                                <p className="text-gray-500 mb-6 leading-relaxed">
                                    Describe your symptoms or ask a health question to get started.
                                </p>
                                <div className="p-3 bg-gray-100 rounded-lg border border-gray-200/80 text-left">
                                    <span className="font-semibold text-orange-600">💡 Example: </span>
                                    <span className="text-gray-700">"I have a persistent headache and feel dizzy."</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-4xl mx-auto w-full">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`p-2 rounded-full h-fit ${message.isUser ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                                        {message.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                                            message.isUser
                                                ? "bg-orange-500 text-white"
                                                : message.isError
                                                ? "bg-red-100 text-red-800 border border-red-200"
                                                : "bg-white text-slate-800 border border-gray-200/80"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold">
                                                {message.isUser ? "You" : "AI Assistant"}
                                            </span>
                                            <span className={`text-xs ${message.isUser ? 'text-orange-100' : 'text-gray-400'}`}>
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>

                                        <div className="leading-relaxed whitespace-pre-wrap text-sm">
                                            {message.text}
                                        </div>

                                        {message.specialists && message.specialists.length > 0 && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <div className="p-1.5 bg-orange-100 rounded border border-orange-200">
                                                        <Stethoscope className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <span className="font-semibold text-sm text-slate-800">Recommended Specialists</span>
                                                </div>
                                                <div className="grid gap-3">
                                                    {message.specialists.map((specialist, specIndex) => (
                                                        <div key={specIndex} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-orange-300 transition-colors">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-slate-800">{specialist.name}</h4>
                                                                    <p className="text-sm text-orange-600 mb-2">{specialist.specialization}</p>
                                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                        <span>{specialist.experience} years exp</span>
                                                                        {specialist.phone && <span>{specialist.phone}</span>}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleBookAppointment(specialist)}
                                                                    className="ml-3 bg-orange-500 hover:bg-orange-600 text-white"
                                                                >
                                                                    <Calendar className="h-3 w-3 mr-1.5" /> Book
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="p-2 rounded-full h-fit bg-gray-200 text-gray-600">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-3 max-w-[85%] shadow-sm">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                            <span className="text-sm text-gray-500">AI is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200/80">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe your symptoms..."
                                disabled={loading}
                                className="flex-1 bg-gray-100 border-gray-300 text-slate-900 placeholder:text-gray-500 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-12 text-base px-5 rounded-xl shadow-sm"
                            />
                            <Button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="h-12 w-12 bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm disabled:opacity-50"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedDoctor && (
                <BookAppointmentModal
                    doctor={selectedDoctor}
                    isOpen={isBookingModalOpen}
                    onClose={() => {
                        setIsBookingModalOpen(false);
                        setSelectedDoctor(null);
                    }}
                />
            )}

            <Dialog open={isReportsDialogOpen} onOpenChange={setIsReportsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-slate-800">
                            <FileText className="h-5 w-5 mr-2 text-orange-500" />
                            Your Medical Reports
                        </DialogTitle>
                    </DialogHeader>
                    {/* Content would be styled with light theme classes */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600">This is a placeholder for the reports list.</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}