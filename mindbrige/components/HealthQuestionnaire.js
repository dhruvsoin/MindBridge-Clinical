"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const WELLNESS_QUESTIONS = [
    // This array remains unchanged but is now interpreted as "Wellness" questions.
    { id: "exercise_frequency", question: "How often do you exercise per week?", options: [ { value: "none", label: "Never or rarely", score: 0 }, { value: "1-2", label: "1-2 times", score: 15 }, { value: "3-4", label: "3-4 times", score: 25 }, { value: "5-6", label: "5-6 times", score: 30 }, { value: "daily", label: "Daily", score: 35 } ] },
    { id: "sleep_hours", question: "How many hours do you sleep on average per night?", options: [ { value: "less-5", label: "Less than 5 hours", score: -10 }, { value: "5-6", label: "5-6 hours", score: 5 }, { value: "7-8", label: "7-8 hours", score: 25 }, { value: "8-9", label: "8-9 hours", score: 20 }, { value: "more-9", label: "More than 9 hours", score: 10 } ] },
    { id: "diet_quality", question: "How would you rate your overall diet quality?", options: [ { value: "poor", label: "Poor (mostly processed foods)", score: -10 }, { value: "fair", label: "Fair (mixed diet)", score: 5 }, { value: "good", label: "Good (balanced with some healthy foods)", score: 15 }, { value: "excellent", label: "Excellent (mostly whole foods)", score: 25 } ] },
    { id: "stress_level", question: "How would you rate your average stress level?", options: [ { value: "very-low", label: "Very low", score: 25 }, { value: "low", label: "Low", score: 20 }, { value: "moderate", label: "Moderate", score: 15 }, { value: "high", label: "High", score: 5 }, { value: "very-high", label: "Very high", score: -10 } ] },
    { id: "water_intake", question: "How much water do you drink per day?", options: [ { value: "less-2", label: "Less than 2 glasses", score: 0 }, { value: "2-4", label: "2-4 glasses", score: 10 }, { value: "5-7", label: "5-7 glasses", score: 20 }, { value: "8+", label: "8+ glasses", score: 25 } ] },
    { id: "smoking_status", question: "Do you smoke or use tobacco products?", options: [ { value: "never", label: "Never smoked", score: 20 }, { value: "former", label: "Former smoker (quit over 1 year ago)", score: 10 }, { value: "recent-quit", label: "Recently quit (less than 1 year)", score: 5 }, { value: "occasional", label: "Occasional smoker", score: -15 }, { value: "regular", label: "Regular smoker", score: -25 } ] },
    { id: "alcohol_consumption", question: "How often do you consume alcohol?", options: [ { value: "never", label: "Never", score: 15 }, { value: "rarely", label: "Rarely (special occasions)", score: 10 }, { value: "weekly", label: "1-2 times per week", score: 5 }, { value: "several-weekly", label: "3-4 times per week", score: -5 }, { value: "daily", label: "Daily", score: -15 } ] },
    { id: "mental_wellness", question: "How often do you feel happy and content?", options: [ { value: "rarely", label: "Rarely", score: -10 }, { value: "sometimes", label: "Sometimes", score: 5 }, { value: "often", label: "Often", score: 15 }, { value: "very-often", label: "Very often", score: 25 }, { value: "always", label: "Almost always", score: 30 } ] },
    { id: "social_connections", question: "How satisfied are you with your social connections?", options: [ { value: "very-unsatisfied", label: "Very unsatisfied", score: -10 }, { value: "unsatisfied", label: "Unsatisfied", score: 0 }, { value: "neutral", label: "Neutral", score: 10 }, { value: "satisfied", label: "Satisfied", score: 20 }, { value: "very-satisfied", label: "Very satisfied", score: 25 } ] },
    { id: "work_life_balance", question: "How would you rate your work-life balance?", options: [ { value: "very-poor", label: "Very poor", score: -15 }, { value: "poor", label: "Poor", score: -5 }, { value: "fair", label: "Fair", score: 5 }, { value: "good", label: "Good", score: 15 }, { value: "excellent", label: "Excellent", score: 25 } ] }
];

export default function WellnessQuestionnaire({ isOpen, onClose, onComplete, previousResponses = {} }) {
    const [responses, setResponses] = useState(previousResponses);
    const [loading, setLoading] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const currentQuestion = WELLNESS_QUESTIONS[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === WELLNESS_QUESTIONS.length - 1;

    const handleAnswerChange = (questionId, value) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
        setTimeout(() => {
            if (!isLastQuestion) handleNext();
        }, 200);
    };

    const handleNext = () => {
        if (!isLastQuestion) setCurrentQuestionIndex(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
    };

    const handleSubmit = async () => {
        const unansweredQuestions = WELLNESS_QUESTIONS.filter(q => !responses[q.id]);
        if (unansweredQuestions.length > 0) {
            alert(`Please answer all ${unansweredQuestions.length} remaining questions.`);
            return;
        }
        setLoading(true);
        try {
            await onComplete(responses);
        } catch (error) {
            console.error("Error submitting questionnaire:", error);
        } finally {
            setLoading(false);
        }
    };

    const progress = (Object.keys(responses).length / WELLNESS_QUESTIONS.length) * 100;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="h-[650px] w-full max-w-md flex flex-col p-0">
                <DialogHeader className="p-6 border-b flex-shrink-0">
                    <DialogTitle className="text-2xl text-slate-800">Wellness Assessment</DialogTitle>
                    <DialogDescription>
                        Answer all {WELLNESS_QUESTIONS.length} questions for your wellness score.
                    </DialogDescription>
                    <div className="mt-3 pt-2">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span>{Object.keys(responses).length} of {WELLNESS_QUESTIONS.length} answered</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 p-6 overflow-y-auto">
                    <Card key={currentQuestion.id} className="border-none shadow-none">
                        <CardContent className="p-1">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-semibold text-orange-700">
                                    {currentQuestionIndex + 1}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-slate-800 mb-4">
                                        {currentQuestion.question}
                                    </h3>
                                    <RadioGroup
                                        value={responses[currentQuestion.id] || ""}
                                        onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                                        className="space-y-3"
                                    >
                                        {currentQuestion.options.map((option) => (
                                            <Label
                                                key={option.value}
                                                htmlFor={`${currentQuestion.id}-${option.value}`}
                                                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                    responses[currentQuestion.id] === option.value
                                                        ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/50'
                                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <RadioGroupItem
                                                    value={option.value}
                                                    id={`${currentQuestion.id}-${option.value}`}
                                                    className="border-gray-300 text-orange-600"
                                                />
                                                <span className="flex-1 text-sm font-normal text-slate-700">{option.label}</span>
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="border-t p-6 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={loading || currentQuestionIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>

                        {isLastQuestion ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || Object.keys(responses).length < WELLNESS_QUESTIONS.length}
                                className="min-w-[150px] bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" /> Get My Score
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={loading || !responses[currentQuestion.id]}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}