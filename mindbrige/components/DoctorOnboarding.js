"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createDoctorProfile } from "@/actions/doctorActions";
import { BookUser, User, GraduationCap, Clock } from "lucide-react"; // Changed icon

const CATEGORIES = [
    "Academic Counseling",
    "Career Counseling",
    "Mental Health Support",
    "Substance Abuse",
    "Family & Relationship",
    "Grief Counseling",
    "Financial Counseling",
    "General Wellness"
];

const DAYS = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00"
];

export default function CounselorOnboarding() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        specialization: "",
        category: "",
        experience: "",
        qualifications: "",
        consultationFee: "",
        availability: DAYS.map(day => ({ day, slots: [], selected: false }))
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDayToggle = (dayIndex) => {
        setFormData(prev => ({
            ...prev,
            availability: prev.availability.map((avail, index) =>
                index === dayIndex
                    ? { ...avail, selected: !avail.selected, slots: !avail.selected ? [] : avail.slots }
                    : avail
            )
        }));
    };

    const handleSlotToggle = (dayIndex, slot) => {
        setFormData(prev => ({
            ...prev,
            availability: prev.availability.map((avail, index) =>
                index === dayIndex
                    ? {
                        ...avail,
                        slots: avail.slots.includes(slot)
                            ? avail.slots.filter(s => s !== slot)
                            : [...avail.slots, slot].sort()
                    }
                    : avail
            )
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const qualificationsArray = formData.qualifications
                .split(',')
                .map(q => q.trim())
                .filter(q => q.length > 0);

            const availabilityData = formData.availability
                .filter(avail => avail.selected && avail.slots.length > 0)
                .map(avail => ({
                    day: avail.day,
                    slots: avail.slots
                }));

            const counselorData = {
                name: formData.name,
                phone: formData.phone,
                specialization: formData.specialization,
                category: formData.category,
                experience: parseInt(formData.experience),
                qualifications: qualificationsArray,
                consultationFee: parseFloat(formData.consultationFee),
                availability: availabilityData
            };

            await createDoctorProfile(counselorData); // Backend action name remains
        } catch (error) {
            console.error("Error creating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-50/50 py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 border border-gray-200 shadow-sm">
                        <BookUser className="h-10 w-10 text-orange-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-3">Complete Your Profile</h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Help students find you by completing your professional profile information.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card className="bg-white border-gray-200/60 shadow-sm rounded-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center space-x-3 text-slate-800">
                                <User className="h-6 w-6 text-orange-500" />
                                <span className="text-xl">Personal Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-700 font-medium">Full Name *</Label>
                                    <Input id="name" className="bg-gray-50 border-gray-300 h-11" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number *</Label>
                                    <Input id="phone" type="tel" className="bg-gray-50 border-gray-300 h-11" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200/60 shadow-sm rounded-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center space-x-3 text-slate-800">
                                <GraduationCap className="h-6 w-6 text-orange-500" />
                                <span className="text-xl">Professional Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="specialization" className="text-gray-700 font-medium">Specialization *</Label>
                                    <Input id="specialization" className="bg-gray-50 border-gray-300 h-11" value={formData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} placeholder="e.g. Cognitive Behavioral Therapy" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-gray-700 font-medium">Category *</Label>
                                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                        <SelectTrigger className="bg-gray-50 border-gray-300 h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>{CATEGORIES.map((category) => (<SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="experience" className="text-gray-700 font-medium">Years of Experience *</Label>
                                    <Input id="experience" type="number" min="0" className="bg-gray-50 border-gray-300 h-11" value={formData.experience} onChange={(e) => handleInputChange('experience', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="consultationFee" className="text-gray-700 font-medium">Session Fee (₹) *</Label>
                                    <Input id="consultationFee" type="number" min="0" step="1" className="bg-gray-50 border-gray-300 h-11" value={formData.consultationFee} onChange={(e) => handleInputChange('consultationFee', e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qualifications" className="text-gray-700 font-medium">Qualifications *</Label>
                                <Textarea id="qualifications" className="bg-gray-50 border-gray-300 min-h-[100px]" value={formData.qualifications} onChange={(e) => handleInputChange('qualifications', e.target.value)} placeholder="Enter qualifications separated by commas (e.g. MA, LPC, PhD)" required />
                                <p className="text-sm text-gray-500">Separate multiple qualifications with commas.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200/60 shadow-sm rounded-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center space-x-3 text-slate-800"><Clock className="h-6 w-6 text-orange-500" /><span className="text-xl">Availability</span></CardTitle>
                            <CardDescription className="text-base pt-1">Select the days and time slots when you're available for sessions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            {formData.availability.map((dayAvail, dayIndex) => (
                                <div key={dayAvail.day} className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox id={dayAvail.day} checked={dayAvail.selected} onCheckedChange={() => handleDayToggle(dayIndex)} className="w-5 h-5" />
                                        <Label htmlFor={dayAvail.day} className="text-lg font-medium text-slate-800">{dayAvail.day}</Label>
                                    </div>
                                    {dayAvail.selected && (
                                        <div className="pl-8 pt-2 border-l-2 border-orange-100 space-y-3">
                                            <p className="text-sm text-gray-500">Select available time slots:</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                                {TIME_SLOTS.map((slot) => (
                                                    <Button key={slot} type="button" variant={dayAvail.slots.includes(slot) ? "default" : "outline"} size="sm" className={`text-xs px-2 py-1 h-auto ${dayAvail.slots.includes(slot) ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`} onClick={() => handleSlotToggle(dayIndex, slot)}>{slot}</Button>
                                                ))}
                                            </div>
                                            {dayAvail.slots.length > 0 && (<p className="text-sm text-orange-600 font-medium">Selected: {dayAvail.slots.length} slots</p>)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200/60 shadow-sm rounded-2xl">
                        <CardContent className="py-6">
                            <Button type="submit" size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base" disabled={loading}>
                                {loading ? "Creating Profile..." : "Submit for Review"}
                            </Button>
                            <p className="text-sm text-gray-500 text-center mt-4">Your profile will be reviewed by our team and you'll be notified upon approval.</p>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}