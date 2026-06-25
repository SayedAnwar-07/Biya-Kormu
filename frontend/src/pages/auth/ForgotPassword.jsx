/* eslint-disable no-unused-vars */
"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Send } from "lucide-react";
import { forgotPassword } from "@/redux/slices/userSlice";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";

const InputWithIcon = ({ icon: Icon, className, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input className={`pl-9 ${className || ""}`} {...props} />
  </div>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((s) => s.user);

  const submit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      const result = await dispatch(forgotPassword({ email })).unwrap();
      toast.success("If the email exists, an OTP has been sent.");
    } catch (error) {
      // Error is already handled by axios interceptor
    }
  };

  return (
    <main className="min-h-screen w-full bg-background">
      <Helmet>
        <title>Forgot Password - Biya Kormu</title>
        <meta
          name="description"
          content="Reset your Biya Kormu account password if you've forgotten it."
        />
      </Helmet>
      <div className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          Forgot Password
        </h1>
        <p className="text-muted-foreground text-center mt-1">
          Enter your email to get a reset OTP.
        </p>

        <form
          onSubmit={submit}
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
            />
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Sending…" : "Send OTP"}
          </Button>

          {/* Debug info */}
          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              Error: {JSON.stringify(error)}
            </div>
          )}
          {message && (
            <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
              Message: {message}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
