import React from "react";
import LoginForms from "@/components/auth/LoginForms";
import { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <Helmet>
        <title>Login - Biya Kormu</title>
        <meta
          name="description"
          content="Login to your Biya Kormu account to manage your events and profile."
        />
      </Helmet>
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="mt-8">
          <LoginForms />
        </div>
      </div>

      {/* Toast container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </main>
  );
}
