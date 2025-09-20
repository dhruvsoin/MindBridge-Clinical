"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookUser, Users } from "lucide-react"; // Replaced Stethoscope with BookUser
import { setUserRole } from "@/actions/userActions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RoleSelection() {
    const { isSignedIn, user } = useUser();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Backend logic is unchanged and still uses "patient" and "doctor" roles
    const handleRoleSelection = async (role) => {
        if (!isSignedIn) {
            return;
        }

        setLoading(true);
        try {
            const result = await setUserRole(role);

            if (result.success) {
                await user.reload();

                if (role === "doctor" && result.needsOnboarding) {
                    router.push("/doctor/onboarding");
                } else if (role === "doctor") {
                    router.push("/doctor");
                } else {
                    router.push("/patient");
                }
            }
        } catch (error) {
            console.error("Error setting role:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Student Card */}
            <Card
                className="group relative overflow-hidden transition-all duration-700 cursor-pointer 
                           backdrop-blur-xl bg-white/[0.02] 
                           border border-white/[0.08] 
                           hover:border-white/[0.15] hover:bg-white/[0.04]
                           shadow-2xl hover:shadow-orange-500/[0.05]
                           before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/[0.06] before:to-transparent before:opacity-0 
                           hover:before:opacity-100 before:transition-opacity before:duration-700"
            >
                <CardHeader className="text-center pb-4 relative z-10">
                    <div
                        className="mx-auto mb-4 p-4 rounded-2xl w-fit relative
                                   backdrop-blur-md bg-white/[0.03] border border-white/[0.1]
                                   group-hover:bg-white/[0.06] group-hover:border-orange-400/[0.2] 
                                   transition-all duration-700
                                   before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-400/[0.08] before:to-transparent 
                                   before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-700 before:rounded-2xl"
                    >
                        <Users className="h-8 w-8 text-white/70 group-hover:text-orange-300 transition-colors duration-700 relative z-10" />
                    </div>
                    <CardTitle className="text-2xl text-white/90 mb-2 font-medium">
                        Continue as Student
                    </CardTitle>
                    <CardDescription className="text-base text-white/60">
                        Book appointments with qualified counselors
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-white/70">
                            <div className="w-1.5 h-1.5 bg-white/40 group-hover:bg-orange-400 rounded-full mr-3 transition-colors duration-700"></div>
                            Browse counselors by specialization
                        </div>
                        <div className="flex items-center text-sm text-white/70">
                            <div className="w-1.5 h-1.5 bg-white/40 group-hover:bg-orange-400 rounded-full mr-3 transition-colors duration-700"></div>
                            Book appointments online
                        </div>
                        <div className="flex items-center text-sm text-white/70">
                            <div className="w-1.5 h-1.5 bg-white/40 group-hover:bg-orange-400 rounded-full mr-3 transition-colors duration-700"></div>
                            Manage your appointments
                        </div>
                    </div>

                    {!isSignedIn ? (
                        <SignInButton mode="redirect" forceRedirectUrl="/">
                            <Button
                                className="w-full backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.12] 
                                           text-white/90 border border-white/[0.15] hover:border-orange-400/[0.3] 
                                           shadow-lg hover:shadow-orange-500/[0.15] transition-all duration-700
                                           relative overflow-hidden
                                           before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-400/[0.1] before:to-transparent 
                                           before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700"
                                size="lg"
                            >
                                Sign In as Student
                            </Button>
                        </SignInButton>
                    ) : (
                        <Button
                            className="w-full backdrop-blur-md bg-white/[0.08] hover:bg-white/[0.12] 
                                       text-white/90 border border-white/[0.15] hover:border-orange-400/[0.3] 
                                       shadow-lg hover:shadow-orange-500/[0.15] transition-all duration-700
                                       relative overflow-hidden
                                       before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-400/[0.1] before:to-transparent 
                                       before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700"
                            size="lg"
                            onClick={() => handleRoleSelection("patient")}
                            disabled={loading}
                        >
                            {loading ? "Setting up..." : "Continue as Student"}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Counselor Card */}
            <Card
                className="group relative overflow-hidden transition-all duration-700 cursor-pointer 
                           backdrop-blur-xl bg-white/[0.02] 
                           border border-white/[0.08] 
                           hover:border-orange-400/[0.25] hover:bg-white/[0.04]
                           shadow-2xl hover:shadow-orange-500/[0.1]
                           before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-400/[0.08] before:to-transparent before:opacity-0 
                           hover:before:opacity-100 before:transition-opacity before:duration-700"
            >
                <CardHeader className="text-center pb-4 relative z-10">
                    <div
                        className="mx-auto mb-4 p-4 rounded-2xl w-fit relative
                                   backdrop-blur-md bg-white/[0.03] border border-white/[0.1]
                                   group-hover:bg-orange-400/[0.08] group-hover:border-orange-400/[0.3] 
                                   transition-all duration-700
                                   before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-400/[0.12] before:to-transparent 
                                   before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-700 before:rounded-2xl"
                    >
                        <BookUser className="h-8 w-8 text-white/70 group-hover:text-orange-200 transition-colors duration-700 relative z-10" />
                    </div>
                    <CardTitle className="text-2xl text-white/90 mb-2 font-medium">
                        Continue as Counselor
                    </CardTitle>
                    <CardDescription className="text-base text-white/60">
                        Manage your schedule and appointments
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-white/70">
                            <div className="w-1.5 h-1.5 bg-white/40 group-hover:bg-orange-400 rounded-full mr-3 transition-colors duration-700"></div>
                            Manage your appointments
                        </div>
                        <div className="flex items-center text-sm text-white/70">
                            <div className="w-1.5 h-1.5 bg-white/40 group-hover:bg-orange-400 rounded-full mr-3 transition-colors duration-700"></div>
                            Set your availability
                        </div>
                        <div className="flex items-center text-sm text-white/70">
                            <div className="w-1.5 h-1.5 bg-white/40 group-hover:bg-orange-400 rounded-full mr-3 transition-colors duration-700"></div>
                            Connect with students
                        </div>
                    </div>

                    {!isSignedIn ? (
                        <SignInButton mode="redirect" forceRedirectUrl="/">
                            <Button
                                className="w-full backdrop-blur-md bg-orange-400/[0.15] hover:bg-orange-400/[0.25] 
                                           text-white border border-orange-400/[0.3] hover:border-orange-300/[0.5] 
                                           shadow-lg hover:shadow-orange-500/[0.25] transition-all duration-700
                                           relative overflow-hidden
                                           before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-300/[0.15] before:to-transparent 
                                           before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700"
                                size="lg"
                            >
                                Sign In as Counselor
                            </Button>
                        </SignInButton>
                    ) : (
                        <Button
                            className="w-full backdrop-blur-md bg-orange-400/[0.15] hover:bg-orange-400/[0.25] 
                                       text-white border border-orange-400/[0.3] hover:border-orange-300/[0.5] 
                                       shadow-lg hover:shadow-orange-500/[0.25] transition-all duration-700
                                       relative overflow-hidden
                                       before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-300/[0.15] before:to-transparent 
                                       before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700"
                            size="lg"
                            onClick={() => handleRoleSelection("doctor")}
                            disabled={loading}
                        >
                            {loading ? "Setting up..." : "Continue as Counselor"}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}