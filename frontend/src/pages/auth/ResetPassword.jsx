/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Hash, Mail } from "lucide-react";
import { resetPassword } from "@/redux/slices/userSlice";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";

const InputWithIcon = ({ icon: Icon, className, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input className={`pl-9 ${className || ""}`} {...props} />
  </div>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.user);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const qpEmail = searchParams.get("email");
    const qpOtp = searchParams.get("otp");
    if (qpEmail) setEmail(qpEmail);
    if (qpOtp) setOtp(qpOtp);
  }, [searchParams]);

  // Show error toast if there's an error from Redux
  useEffect(() => {
    if (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.password?.[0] ||
        error.message ||
        "An error occurred during password reset";
      toast.error(errorMessage);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    if (!otp) {
      toast.error("OTP is required.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const result = await dispatch(
        resetPassword({
          email,
          otp,
          password,
          confirm_password: confirmPassword,
        }),
      ).unwrap();

      toast.success(
        result.message || "Password reset successfully. Please log in.",
      );
      navigate("/login");
    } catch (error) {
      console.error("Password reset error:", error);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background">
      <Helmet>
        <title>Reset Password - Biya Kormu</title>
        <meta
          name="description"
          content="Set a new password for your Biya Kormu account."
        />
      </Helmet>
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          Reset Password
        </h1>
        <p className="text-muted-foreground text-center mt-1">
          Set a new password for your account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border bg-card p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <InputWithIcon
              id="email"
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!searchParams.get("email")} // Disable if email comes from URL
            />
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <InputWithIcon
              id="otp"
              icon={Hash}
              placeholder="6-digit OTP"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={!!searchParams.get("otp")} // Disable if OTP comes from URL
            />
          </div>

          <div className="mt-4 grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-10"
                  placeholder="***********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-9 pr-10"
                  placeholder="***********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                  aria-label="Toggle password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading ? "Resetting…" : "Reset Password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
