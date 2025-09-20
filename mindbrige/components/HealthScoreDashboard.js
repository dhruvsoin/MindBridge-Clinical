"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Heart, Brain, Activity, Apple, Moon, Smile,
    TrendingUp, TrendingDown, Minus, Play, RefreshCw,
    ChevronLeft
} from "lucide-react";
import HealthQuestionnaire from "./HealthQuestionnaire";
import { getHealthData, updateHealthScore } from "@/actions/healthActions";
import AIHealthInsights from "./AIHealthInsights";

const ACCENT_COLOR = "#F97316"; // Orange-500

const GlowingScoreVisual = ({ score }) => {
    const circumference = 2 * Math.PI * 84;

    return (
        <>
            <style jsx global>{`
                @keyframes pulse-accent { 50% { filter: drop-shadow(0 0 25px ${ACCENT_COLOR}); } }
                .animate-pulse-accent { animation: pulse-accent 3s infinite ease-in-out; }
            `}</style>
            <div className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                    <circle cx="96" cy="96" r="84" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    <circle
                        cx="96" cy="96" r="84" fill="none"
                        stroke={ACCENT_COLOR}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (score / 100) * circumference}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="w-full h-full flex items-center justify-center">
                    <Brain
                        className="w-28 h-28 text-orange-500 transition-all duration-1000 animate-pulse-accent"
                        style={{ filter: `drop-shadow(0 0 15px ${ACCENT_COLOR})` }}
                    />
                </div>
            </div>
        </>
    );
};

export default function WellnessScoreDashboard({ student }) {
    const [healthData, setHealthData] = useState(null);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHealthData();
    }, []);

    const loadHealthData = async () => {
        try {
            const data = await getHealthData();
            setHealthData(data);
        } catch (error) {
            console.error("Error loading health data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionnaireComplete = async (responses) => {
        try {
            setLoading(true);
            const updatedData = await updateHealthScore(responses);
            setHealthData(updatedData);
            setShowQuestionnaire(false);
        } catch (error) {
            console.error("Error updating score:", error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreStatus = (score) => {
        if (score >= 80) return { text: "Excellent", color: "bg-teal-100 text-teal-800 border-teal-200" };
        if (score >= 60) return { text: "Good", color: "bg-green-100 text-green-800 border-green-200" };
        if (score >= 40) return { text: "Fair", color: "bg-amber-100 text-amber-800 border-amber-200" };
        return { text: "Needs Improvement", color: "bg-red-100 text-red-700 border-red-200" };
    };

    const getTrendIcon = (trend) => {
        if (trend === 'improving') return <TrendingUp className="h-5 w-5 text-green-500" />;
        if (trend === 'declining') return <TrendingDown className="h-5 w-5 text-red-500" />;
        return <Minus className="h-5 w-5 text-gray-500" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50/50 flex items-center justify-center p-8">
                <RefreshCw className="h-10 w-10 animate-spin text-orange-500" />
            </div>
        );
    }

    const currentScore = healthData?.current_score || 0;
    const questionnaireScore = healthData?.questionnaire_score || 0;
    const aiScore = healthData?.ai_score || 0;
    const scoreStatus = getScoreStatus(currentScore);
    const categoryScores = healthData?.questionnaire?.categories || {};

    return (
        <div className="min-h-screen bg-orange-50/50 text-slate-800 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon" className="bg-white hover:bg-gray-100 rounded-full w-10 h-10 flex-shrink-0">
                            <Link href="/patient" aria-label="Go back to student page">
                                <ChevronLeft className="h-5 w-5 text-gray-600" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Wellness Dashboard</h1>
                            <p className="text-gray-500 mt-1 text-base md:text-lg">Your personalized wellness overview.</p>
                        </div>
                    </div>
                    <Button onClick={() => setShowQuestionnaire(true)} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white h-12 px-6 text-base">
                        <Play className="h-5 w-5 mr-2" />
                        {healthData?.questionnaire ? "Retake Assessment" : "Take Assessment"}
                    </Button>
                </div>

                {healthData?.questionnaire ? (
                    <Card className="bg-white border border-gray-200/60 rounded-2xl shadow-sm">
                        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
                            <div className="md:col-span-2 flex justify-center items-center">
                                <GlowingScoreVisual score={currentScore} />
                            </div>
                            <div className="md:col-span-3 space-y-6">
                                <div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-6xl md:text-7xl font-bold" style={{ color: ACCENT_COLOR }}>
                                            {currentScore}
                                            <span className="text-4xl text-gray-400">/100</span>
                                        </span>
                                        <div className="flex flex-col gap-2">
                                            <Badge className={`${scoreStatus.color} border py-1 px-3 text-sm`}>{scoreStatus.text}</Badge>
                                            {healthData?.trend && getTrendIcon(healthData.trend)}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 mt-2">Your overall wellness score based on recent data.</p>
                                </div>
                                <Progress value={currentScore} className="h-3 bg-gray-200 [&>*]:bg-orange-500" />

                                {(questionnaireScore > 0 || aiScore > 0) && (
                                    <div className="space-y-3 pt-2">
                                        <h3 className="font-medium text-slate-700">Score Breakdown</h3>
                                        <div className="flex flex-col sm:flex-row gap-4 text-sm">
                                            {questionnaireScore > 0 && (
                                                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                                                    <span className="text-gray-600">Assessment:</span>
                                                    <span className="font-bold text-slate-800">{questionnaireScore}</span>
                                                </div>
                                            )}
                                            {aiScore > 0 && (
                                                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                                                    <span className="font-semibold" style={{ color: ACCENT_COLOR }}>AI Analysis:</span>
                                                    <span className="font-bold text-slate-800">{aiScore}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-white border border-gray-200/60 rounded-2xl shadow-sm">
                        <CardContent className="text-center p-12 md:p-16">
                            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold text-slate-800 mb-4">Start Your Wellness Journey</h3>
                            <p className="text-lg text-gray-500 mb-8 max-w-lg mx-auto">Take our comprehensive wellness assessment to get your personalized score and AI-powered recommendations.</p>
                            <Button onClick={() => setShowQuestionnaire(true)} size="lg" className="text-white h-14 px-8 text-lg" style={{ backgroundColor: ACCENT_COLOR }}>
                                <Play className="h-5 w-5 mr-3" />
                                Take Wellness Assessment
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {Object.keys(categoryScores).length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 text-center md:text-left">Category Breakdown</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries({
                                diet: { title: 'Diet & Nutrition', Icon: Apple },
                                exercise: { title: 'Physical Activity', Icon: Activity },
                                sleep: { title: 'Sleep & Rest', Icon: Moon },
                                mental_health: { title: 'Mental Wellness', Icon: Smile },
                            }).map(([key, { title, Icon }]) => (
                                <Card key={key} className="bg-white border border-gray-200/60 rounded-xl shadow-sm overflow-hidden">
                                    <CardContent className="p-6 flex flex-col justify-between gap-4 h-full">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                                    <Icon className="h-6 w-6 text-gray-500" />
                                                </div>
                                                <CardTitle className="text-base font-medium text-slate-800">{title}</CardTitle>
                                            </div>
                                            <span className="text-2xl font-bold text-slate-800">{categoryScores[key] || 0}</span>
                                        </div>
                                        <Progress value={categoryScores[key] || 0} className="h-2 bg-gray-200 [&>*]:bg-orange-500" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {healthData?.questionnaire && (
                    <AIHealthInsights healthData={healthData} onRefresh={loadHealthData} />
                )}
            </div>

            {showQuestionnaire && (
                <HealthQuestionnaire
                    isOpen={showQuestionnaire}
                    onClose={() => setShowQuestionnaire(false)}
                    onComplete={handleQuestionnaireComplete}
                    previousResponses={healthData?.questionnaire?.responses}
                />
            )}
        </div>
    );
}