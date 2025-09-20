"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { createAppointment } from "@/actions/appointmentActions";
import { createPaymentOrder, verifyPayment } from "@/actions/paymentActions";
import { CalendarDays, Clock, CreditCard, CheckCircle } from "lucide-react";

function BookAppointmentModal({ doctor, isOpen, onClose, onViewAppointments }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState("booking");
  const [isShowing, setIsShowing] = useState(false);


  const router = useRouter();
  const pathname = usePathname();

  // --- Logic remains unchanged ---
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isDateAvailable = useCallback(
    (date) => {
      if (!doctor.availability) return false;
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      return doctor.availability.some(
        (avail) => avail.day === dayName && avail.slots.length > 0
      );
    },
    [doctor.availability]
  );

  const getAvailableSlots = useCallback(() => {
    if (!selectedDate || !doctor.availability) return [];
    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const availability = doctor.availability.find(
      (avail) => avail.day === dayName
    );
    return availability?.slots || [];
  }, [selectedDate, doctor.availability]);

  const handleClose = useCallback(() => {
    // A slight delay to allow the closing animation to finish before resetting state
    setTimeout(() => {
        setSelectedDate(null);
        setSelectedSlot("");
        setReason("");
        setPaymentStep("booking");
        setLoading(false);
    }, 300);
    onClose();
  }, [onClose]);


  const handleViewAppointment = useCallback(() => {
    handleClose();
    // Use a timeout to ensure modal is closed before navigation
    setTimeout(() => {
      if (pathname === "/chatbot") {
        router.push("/patient?tab=my-appointments");
      } else if (onViewAppointments) {
        onViewAppointments();
      } else {
        router.push("/patient?tab=my-appointments");
      }
    }, 100);
  }, [pathname, router, onViewAppointments, handleClose]);


  const isDateDisabled = useCallback(
    (date) => {
      return date < today || !isDateAvailable(date);
    },
    [today, isDateAvailable]
  );

  const handlePayment = useCallback(async () => {
    if (!selectedDate || !selectedSlot) {
      alert("Please select a date and time slot.");
      return;
    }
    if (!window.Razorpay) {
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }
    setLoading(true);
    try {
      const orderData = await createPaymentOrder(doctor._id);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Wellness Portal",
        description: `Consultation with ${doctor.name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            console.log("Payment successful, verifying...", response);
            setLoading(true);
            
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            if (verificationResult.success) {
              console.log("Payment verified, creating appointment...");
              const appointmentDateTime = new Date(selectedDate);
              const [hours, minutes] = selectedSlot.split(":");
              appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
              
              const appointmentResult = await createAppointment({
                doctorId: doctor._id,
                appointmentDate: appointmentDateTime.toISOString(),
                reason,
                paymentId: verificationResult.paymentId,
              });
              
              if (appointmentResult.success) {
                console.log("Appointment created successfully");
                setPaymentStep("success");
              } else {
                console.error("Appointment creation failed");
                alert("Payment successful but appointment creation failed. Please contact support with your payment ID: " + verificationResult.paymentId);
              }
            } else {
                console.error("Payment verification failed");
                alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Payment verification or appointment creation error:", error);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: "Patient User",
          email: "patient.user@example.com",
          contact: "9000000000",
        },
        theme: {
          color: "#F97316", // Orange theme color
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Could not initiate payment. Please try again.");
      setLoading(false);
    }
  }, [selectedDate, selectedSlot, doctor._id, doctor.name, reason]);

  useEffect(() => {
    const loadRazorpay = () => {
      if (document.getElementById('razorpay-checkout-js')) return;
      const script = document.createElement("script");
      script.id = 'razorpay-checkout-js';
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.head.appendChild(script);
    };

    if (isOpen) {
      loadRazorpay();
    }
  }, [isOpen]);

  // Handle mounting/unmounting for animations
  useEffect(() => {
    if (isOpen) {
      setIsShowing(true);
    } else {
        // isShowing is set to false after the animation duration
        setIsShowing(false);
    }
  }, [isOpen]);


  if (!isOpen && !isShowing) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      ></div>

      <div
        className={`custom-scrollbar relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200/60 rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-300 ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {paymentStep === "success" ? (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto p-3 bg-teal-100 rounded-full w-fit border-4 border-white">
              <CheckCircle className="h-10 w-10 text-teal-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                Appointment Booked!
              </h3>
              <p className="text-gray-600 text-lg">
                Your appointment with {doctor.name} is confirmed.
              </p>
            </div>
            <button
              onClick={handleViewAppointment}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-base rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              View My Appointments
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Book Appointment
              </h2>
              <p className="text-gray-500 text-base mt-1">
                with {doctor.name}
              </p>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-lg text-slate-800">{doctor.name}</h3>
                    <p className="text-orange-600 font-medium">{doctor.specialization}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-700">
                        <span>₹{doctor.consultationFee}</span>
                        <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{doctor.category}</span>
                    </div>
                </div>

              <div className="space-y-6">
                <div>
                  <label className="text-base font-medium text-gray-700 mb-2 block">
                    <CalendarDays className="h-4 w-4 inline mr-2" />
                    Select Date
                  </label>
                  <div
                    className="bg-white rounded-lg border border-gray-200 p-2"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateDisabled}
                      className="w-full"
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <label className="text-base font-medium text-gray-700 mb-3 block">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {getAvailableSlots().map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-2 py-2 text-sm font-semibold rounded-md transition-all border ${
                            selectedSlot === slot
                              ? "bg-orange-500 text-white border-orange-500 shadow"
                              : "bg-gray-100 text-gray-800 border-gray-200 hover:border-orange-400 hover:text-orange-600"
                          } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                    {getAvailableSlots().length === 0 && (
                      <p className="text-gray-500 text-sm mt-2">
                        No slots available for this day.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="reason" className="text-base font-medium text-gray-700 mb-2 block">
                    Reason for Visit (Optional)
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Brief description of your symptoms..."
                    rows={3}
                    className="w-full bg-gray-50 border-gray-300 text-gray-900 rounded-md focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-gray-400 text-base p-2 transition-colors"
                  />
                </div>

                {selectedDate && selectedSlot && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold mb-2 text-orange-900">
                      Appointment Summary
                    </h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{selectedDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{selectedSlot}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-orange-700 pt-1 mt-1 border-t border-orange-200">
                        <span>Total Fee:</span>
                        <span>₹{doctor.consultationFee}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={loading || !selectedDate || !selectedSlot}
                    className="w-full flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading
                      ? "Processing..."
                      : `Pay ₹${doctor.consultationFee} & Book`}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(BookAppointmentModal);