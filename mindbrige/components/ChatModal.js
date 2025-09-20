"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, User, BookUser } from "lucide-react"; // Changed icon
import { pusherClient } from "@/lib/pusher";
import {
    createOrGetChat,
    getChatMessages,
    sendMessage,
} from "@/actions/chatActions";

export default function ChatModal({ appointment, isOpen, onClose }) {
    const { user } = useUser();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chatId, setChatId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Backend role logic remains unchanged
    const userRole = user?.publicMetadata?.role;
    const isDoctor = userRole === "doctor"; 
    const otherUser = isDoctor ? appointment.patient : appointment.doctor;

    useEffect(() => {
        if (isOpen && appointment) {
            initializeChat();
        }

        return () => {
            if (chatId) {
                pusherClient.unsubscribe(`chat-${chatId}`);
            }
        };
    }, [isOpen, appointment]);

    useEffect(() => {
        if (chatId) {
            const channel = pusherClient.subscribe(`chat-${chatId}`);
            channel.bind("new-message", (message) => {
                setMessages((prev) => [...prev, message]);
            });

            return () => {
                pusherClient.unsubscribe(`chat-${chatId}`);
            };
        }
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = async () => {
        try {
            setLoading(true);
            const chat = await createOrGetChat(appointment._id);
            setChatId(chat._id);
            const existingMessages = await getChatMessages(chat._id);
            setMessages(existingMessages);
        } catch (error) {
            console.error("Error initializing chat:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId || sending) return;

        setSending(true);
        const senderName = isDoctor
            ? `${appointment.doctor?.name || "Counselor"}` // UI fallback text changed
            : appointment.patient?.name || "Student"; // UI fallback text changed

        try {
            await sendMessage(
                chatId,
                newMessage.trim(),
                user.id,
                senderName,
                userRole
            );
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleClose = () => {
        setChatId(null);
        setMessages([]);
        setLoading(true);
        setSending(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
                <DialogHeader className="flex-shrink-0 p-4 border-b">
                    <DialogTitle className="flex items-center space-x-2 text-slate-800">
                        <MessageCircle className="h-5 w-5 text-orange-500" />
                        <span>
                            Chat with{" "}
                            {isDoctor
                                ? otherUser?.name || "Student"
                                : otherUser?.name || "Counselor"}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Appointment on{" "}
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="h-full w-full">
                        <div className="p-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-full min-h-[300px]">
                                    <div className="text-gray-500">Loading chat...</div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full min-h-[300px] text-center">
                                    <div className="space-y-2">
                                        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto" />
                                        <p className="text-gray-600">No messages yet</p>
                                        <p className="text-sm text-gray-500">
                                            Start the conversation!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message, index) => {
                                        const isOwnMessage = message.senderId === user?.id;

                                        return (
                                            <div
                                                key={message._id || index}
                                                className={`flex items-end gap-3 ${isOwnMessage ? "justify-end" : "justify-start"
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwnMessage
                                                            ? "bg-orange-500 text-white"
                                                            : "bg-gray-100 text-slate-800 border"
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        {message.senderType === "doctor" ? (
                                                            <BookUser className={`h-3.5 w-3.5 ${isOwnMessage ? 'text-orange-100' : 'text-gray-500'}`} />
                                                        ) : (
                                                            <User className={`h-3.5 w-3.5 ${isOwnMessage ? 'text-orange-100' : 'text-gray-500'}`} />
                                                        )}
                                                        <span className={`text-xs font-semibold ${isOwnMessage ? 'text-orange-100' : 'text-slate-700'}`}>
                                                            {message.senderName}
                                                        </span>
                                                        <span className={`text-xs ${isOwnMessage ? 'text-orange-200' : 'text-gray-400'}`}>
                                                            {formatTime(message.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm">{message.message}</p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <div className="flex-shrink-0 border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-100 border-gray-300 text-slate-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
                            disabled={loading || sending}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={!newMessage.trim() || loading || sending}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}