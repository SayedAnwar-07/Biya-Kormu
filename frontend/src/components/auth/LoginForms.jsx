import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "@/redux/slices/userSlice";
import { toast } from "react-hot-toast";

// eslint-disable-next-line no-unused-vars
const InputWithIcon = ({ icon: Icon, className, ...props }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <Input className={`pl-9 ${className ?? ""}`} {...props} />
  </div>
);

export default function LoginForms() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();

      if (result.user) {
        toast.success("Login successful!");
        navigate(`/profile/${result.user.slug}/`);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  React.useEffect(() => {
    if (error) {
      toast.error(error.error || "Login failed. Please try again.");
    }
  }, [error]);

  return (
    <div className=" flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-[#fe4956] p-3 rounded-full">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          {/* Email */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="email" className="text-gray-700">
              Email address
            </Label>
            <InputWithIcon
              id="email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="focus:ring-[#fe4956] focus:border-[#fe4956]"
            />
          </div>

          {/* Password */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                className="pl-9 pr-10 focus:ring-[#fe4956] focus:border-[#fe4956]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-[#fe4956] transition-colors"
                aria-label="Toggle password visibility"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Row: remember + forgot */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="data-[state=checked]:bg-[#fe4956]"
              />
              <Label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </Label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-[#fe4956] hover:text-red-900 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#fe4956] hover:bg-red-900 text-white py-2 rounded-lg transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="mt-6 mb-6">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <Separator className="flex-1" />
              <span>or continue with</span>
              <Separator className="flex-1" />
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#fe4956] hover:text-red-900 font-medium transition-colors"
            >
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
