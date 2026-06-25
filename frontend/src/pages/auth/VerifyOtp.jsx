"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Timer, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";

import { verifyOtp, resendOtp } from "@/redux/slices/userSlice";
import { Helmet } from "react-helmet-async";

// eslint-disable-next-line no-unused-vars
const InputWithIcon = ({ icon: Icon, className, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input className={`pl-9 ${className || ""}`} {...props} />
  </div>
);

export default function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, user, error, message } = useSelector((s) => s.user);

  const [email, setEmail] = useState(
    location?.state?.email || user?.email || "",
  );
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [resendLoading, setResendLoading] = useState(false);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (!cooldown) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Clear errors when email or OTP changes
  useEffect(() => {
    setFieldErrors({});
  }, [email, otp]);

  const handlePaste = (e) => {
    const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "");
    if (!text) return;
    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = text[i] || "";
    }
    setOtp(next);
    const lastFilled = Math.min(text.length, 6) - 1;
    if (lastFilled >= 0) inputsRef.current[lastFilled]?.focus();
    if (text.length === 6) {
      setTimeout(() => submit(null, next), 0);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);

    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleError = (error) => {
    if (error?.fieldErrors) {
      setFieldErrors(error.fieldErrors);

      // Show field-specific errors as toasts
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        toast.error(`${field}: ${message}`);
      });
    }

    if (error?.globalErrors?.length) {
      error.globalErrors.forEach((msg) => toast.error(msg));
    }
  };

  const submit = async (e, forcedOtpArr) => {
    e?.preventDefault?.();
    const code = (forcedOtpArr || otp).join("");

    if (!email) {
      toast.error("Email is required.");
      return;
    }

    if (code.length !== 6) {
      toast.error("Please enter 6-digit code.");
      return;
    }

    try {
      const payload = { email, otp: code };
      const res = await dispatch(verifyOtp(payload)).unwrap();
      toast.success(res?.message || "Email verified successfully!");
      navigate("/login", {
        state: { message: "Your account has been verified. Please login." },
      });
    } catch (err) {
      handleError(err);
    }
  };

  const handleResend = async () => {
    if (cooldown || resendLoading) return;
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }

    try {
      setResendLoading(true);
      const result = await dispatch(resendOtp(email)).unwrap();

      if (result.message) {
        toast.success(result.message);
      } else {
        toast.success("OTP has been resent to your email.");
      }

      setCooldown(45);
    } catch (err) {
      // Handle specific error cases
      if (err?.fieldErrors?.email) {
        toast.error(err.fieldErrors.email);
      } else if (err?.globalErrors?.length) {
        err.globalErrors.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Verify OTP - Biya Kormu</title>
        <meta
          name="description"
          content="Verify your One Time Password to secure your Biya Kormu account."
        />
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit verification code sent to your email address
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error?.globalErrors?.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.globalErrors[0]}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <InputWithIcon
                id="email"
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={fieldErrors.email ? "border-destructive" : ""}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Verification Code</Label>
              <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
                {otp.map((v, i) => (
                  <div key={i}>
                    <Input
                      ref={(el) => (inputsRef.current[i] = el)}
                      inputMode="numeric"
                      aria-label={`Digit ${i + 1}`}
                      className={`text-center font-mono text-lg ${
                        fieldErrors.otp ? "border-destructive" : ""
                      }`}
                      maxLength={1}
                      value={v}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
              {fieldErrors.otp && (
                <p className="text-sm text-destructive">{fieldErrors.otp}</p>
              )}
              {fieldErrors.otp_expiry && (
                <p className="text-sm text-destructive">
                  {fieldErrors.otp_expiry}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={!!cooldown || resendLoading || loading}
                className="sm:w-auto"
              >
                {resendLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending...
                  </>
                ) : cooldown ? (
                  <>
                    <Timer className="mr-2 h-4 w-4" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>

              <Button
                type="submit"
                disabled={loading || !isComplete || resendLoading}
                className="sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Didn't receive the code?</p>
            <p>Check your spam folder or try resending.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
