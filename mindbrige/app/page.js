"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import RoleSelection from "@/components/RoleSelection";
import { useEffect } from "react";

export default function Home() {
    const { isLoaded, user } = useUser();
    const router = useRouter();

    // Backend functionality is NOT changed. It still uses "patient" and "doctor".
    useEffect(() => {
        if (isLoaded && user) {
            const role = user.publicMetadata?.role;
            if (role === "patient") router.push("/patient");
            if (role === "doctor") router.push("/doctor");
        }
    }, [isLoaded, user, router]);

    return (
        <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 overflow-hidden bg-black">
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ filter: "brightness(0.3)" }}
                >
                    <source src="/bg.webm" type="video/webm" />
                    <source src="/bg.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Main Content Container */}
            <div className="relative z-20 w-full max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="mb-6">
                        <span className="inline-block px-6 py-3 rounded-full bg-zinc-900 text-orange-400 text-sm font-medium shadow-neubrutalism">
                            ✨ Next-Generation Wellness Platform
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Next-Gen Wellness
                        <br />
                        <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                            at Your Fingertips
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Experience personalized wellness scores, insightful guidance,
                        and AI-powered support—all in one revolutionary application.
                    </p>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-8 shadow-neubrutalism-lg border border-zinc-800">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Choose Your <span className="text-orange-400">Role</span>
                        </h2>
                        <p className="text-zinc-400">
                            Select how you'd like to access our wellness platform
                        </p>
                    </div>
                    <RoleSelection />
                </div>
            </div>

            {/* Floating elements */}
            <div className="absolute top-20 left-10 w-3 h-3 bg-orange-400 rounded-full shadow-neubrutalism-sm animate-pulse z-10"></div>
            <div className="absolute top-40 right-20 w-2 h-2 bg-orange-300 rounded-full shadow-neubrutalism-sm animate-pulse z-10"></div>
            <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-orange-500 rounded-full shadow-neubrutalism-sm animate-pulse z-10"></div>
        </div>
    );
}