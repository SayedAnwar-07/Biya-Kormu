import React from "react";
import RegisterForms from "@/components/auth/RegisterForms";
import { Helmet } from "react-helmet-async";

export default function Register() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Helmet>
        <title>Create Account - Biya Kormu</title>
        <meta
          name="description"
          content="Sign up for Biya Kormu to create and manage events, or discover exciting events happening around you."
        />
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          Create Account
        </h1>
        <p className="text-muted-foreground text-center mt-1">
          Fill in your details to get started
        </p>
        <div className="mt-8">
          <RegisterForms />
        </div>
      </div>
    </main>
  );
}
