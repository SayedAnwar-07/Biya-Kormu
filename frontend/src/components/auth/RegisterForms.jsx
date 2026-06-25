"use client";
import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import { registerUser, clearError } from "@/redux/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Eye,
  EyeOff,
  Upload,
  ImagePlus,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
} from "lucide-react";
import { uploadImageToImgbb } from "@/lib/uploadImageToImgbb";
import TermsModal from "./TermsModal";
import AvatarCropper from "./AvatarCropper";

/* ---------- Small shared inputs ---------- */

const InputWithIcon = ({ icon: Icon, className = "", ...props }) => (
  <div className="relative">
    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <Input className={`pl-9 ${className}`} {...props} />
  </div>
);

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  error,
  show,
  toggleShow,
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <Lock className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        id={id}
        type={show ? "text" : "password"}
        className={`pl-9 pr-10 ${error ? "border-destructive" : ""}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
        aria-label="Toggle password"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}


export default function RegisterForms() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const fieldErrors = error?.fieldErrors || {};
  const globalErrors = error?.globalErrors || [];
  const [clientErrors, setClientErrors] = useState({});
  const mergedErrors = { ...fieldErrors, ...clientErrors };

  // form state
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [role, setRole] = useState("customer");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // terms state
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  // avatar state
  const fileRef = useRef();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [rawImage, setRawImage] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);

  const defaultAvatar =
    "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  /* -------- error helpers (client-side) -------- */
  const setFieldError = (name, msg) =>
    setClientErrors((prev) => ({ ...prev, [name]: msg }));

  const clearClientError = (name) => {
    if (clientErrors[name]) {
      const copy = { ...clientErrors };
      delete copy[name];
      setClientErrors(copy);
    }
  };

  /* -------- avatar upload / crop -------- */
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setCropOpen(true);
    };
    reader.readAsDataURL(f);
  };

  const handleCropSave = async (blob) => {
    try {
      setUploadingAvatar(true);
      const url = await uploadImageToImgbb(blob);
      setAvatarUrl(url);
      setCropOpen(false);
      toast.success("Profile image uploaded.");
    } catch (e) {
      toast.error(e.message || "Failed to upload image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* -------- live password error clearing -------- */
  useEffect(() => {
    if (pw && pw2 && pw === pw2) {
      setClientErrors((prev) => {
        const copy = { ...prev };
        delete copy.password;
        delete copy.confirm_password;
        return copy;
      });
    }
  }, [pw, pw2]);

  /* -------- submit -------- */
  const onSubmit = (e) => {
    e.preventDefault();

    setClientErrors({});
    dispatch(clearError());

    if (!termsChecked) {
      setFieldError("accepted_terms", "You must accept the terms.");
      setTermsOpen(true);
      return;
    }

    if (pw !== pw2) {
      setFieldError("password", "Passwords must match.");
      setFieldError("confirm_password", "Passwords must match.");
      toast.error("Passwords do not match.");
      return;
    }

    const userData = {
      email,
      first_name: first,
      last_name: last,
      profile_image: avatarUrl || defaultAvatar,
      phone_number: mobile,
      whatsapp_number: whatsapp || mobile,
      user_type: role,
      accepted_terms: termsChecked,
      password: pw,
      confirm_password: pw2,
    };

    dispatch(registerUser(userData))
      .unwrap()
      .then((res) => {
        toast.success(res.message || "Registered successfully!");
        navigate("/verify-otp");
      })
      .catch((err) => {
        if (err?.globalErrors?.length) {
          toast.error(err.globalErrors[0]);
        } else if (err?.fieldErrors) {
          const firstField = Object.keys(err.fieldErrors)[0];
          if (firstField) toast.error(err.fieldErrors[firstField]);
        } else {
          toast.error("Registration failed.");
        }
      });
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 shadow-sm"
      >
        {/* Global API errors banner */}
        {globalErrors.length > 0 && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <div>
                {globalErrors.map((g, i) => (
                  <div key={i}>{g}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-start gap-5">
          <Avatar className="h-20 w-20">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="Profile" />
            ) : (
              <AvatarFallback>
                <ImagePlus className="h-6 w-6" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              Profile Image{" "}
              <span className="text-muted-foreground">(optional)</span>
            </p>
            <p className="text-xs text-muted-foreground">
              JPG/PNG/JPEG · Max 5MB · Crop freely (square, horizontal,
              vertical)
            </p>
            <div className="mt-2 flex gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onFileChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingAvatar ? "Uploading..." : "Upload"}
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCropOpen(true)}
                  disabled={uploadingAvatar}
                >
                  Re-crop
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Names */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first">First name</Label>
            <InputWithIcon
              id="first"
              icon={User}
              value={first}
              onChange={(e) => {
                setFirst(e.target.value);
                clearClientError("first_name");
              }}
              placeholder="First name"
              className={mergedErrors.first_name ? "border-destructive" : ""}
            />
            {mergedErrors.first_name && (
              <p className="text-xs text-destructive">
                {mergedErrors.first_name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last">Last name</Label>
            <InputWithIcon
              id="last"
              icon={User}
              value={last}
              onChange={(e) => {
                setLast(e.target.value);
                clearClientError("last_name");
              }}
              placeholder="Last name"
              className={mergedErrors.last_name ? "border-destructive" : ""}
            />
            {mergedErrors.last_name && (
              <p className="text-xs text-destructive">
                {mergedErrors.last_name}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="mt-4 space-y-2">
          <Label htmlFor="email">Email address</Label>
          <InputWithIcon
            id="email"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearClientError("email");
            }}
            placeholder="Email address"
            className={mergedErrors.email ? "border-destructive" : ""}
          />
          {mergedErrors.email && (
            <p className="text-xs text-destructive">{mergedErrors.email}</p>
          )}
        </div>

        {/* Mobile */}
        <div className="mt-4 space-y-2">
          <Label htmlFor="mobile">Mobile number</Label>
          <InputWithIcon
            id="mobile"
            type="tel"
            icon={Phone}
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value);
              clearClientError("phone_number");
            }}
            placeholder="Mobile number (e.g., 0123456789)"
            className={mergedErrors.phone_number ? "border-destructive" : ""}
          />
          {mergedErrors.phone_number && (
            <p className="text-xs text-destructive">
              {mergedErrors.phone_number}
            </p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="mt-4 space-y-2">
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <InputWithIcon
            id="whatsapp"
            type="tel"
            icon={Phone}
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value);
              clearClientError("whatsapp_number");
            }}
            placeholder="WhatsApp number"
            className={mergedErrors.whatsapp_number ? "border-destructive" : ""}
          />
          {mergedErrors.whatsapp_number && (
            <p className="text-xs text-destructive">
              {mergedErrors.whatsapp_number}
            </p>
          )}
        </div>

        {/* Role */}
        <div className="mt-4 space-y-2">
          <Label>Select role</Label>
          <Select
            value={role}
            onValueChange={(v) => {
              setRole(v);
              clearClientError("user_type");
            }}
          >
            <SelectTrigger
              className={mergedErrors.user_type ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="seller">Seller</SelectItem>
            </SelectContent>
          </Select>
          {mergedErrors.user_type && (
            <p className="text-xs text-destructive">{mergedErrors.user_type}</p>
          )}
        </div>

        {/* Passwords */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
            <PasswordInput
              id="pw"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                clearClientError("password");
                if (e.target.value === pw2)
                  clearClientError("confirm_password");
              }}
              placeholder="Create a password"
              error={mergedErrors.password}
              show={showPw}
              toggleShow={() => setShowPw((s) => !s)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pw2">Confirm password</Label>
            <PasswordInput
              id="pw2"
              value={pw2}
              onChange={(e) => {
                setPw2(e.target.value);
                clearClientError("confirm_password");
                if (pw === e.target.value) clearClientError("password");
              }}
              placeholder="Confirm your password"
              error={mergedErrors.confirm_password}
              show={showPw2}
              toggleShow={() => setShowPw2((s) => !s)}
            />
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 flex items-center gap-3">
          <Checkbox
            id="terms"
            checked={termsChecked}
            onCheckedChange={() => setTermsOpen(true)}
            className={mergedErrors.accepted_terms ? "border-destructive" : ""}
          />
          <Label htmlFor="terms" className="text-sm leading-6">
            I agree to the{" "}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => setTermsOpen(true)}
            >
              Terms &amp; Conditions
            </button>
          </Label>
          {termsChecked && (
            <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
          )}
        </div>
        {mergedErrors.accepted_terms && (
          <p className="mt-1 text-xs text-destructive">
            {mergedErrors.accepted_terms}
          </p>
        )}

        <Button
          type="submit"
          className="mt-6 w-full bg-[#fe4956]"
          disabled={loading || uploadingAvatar}
        >
          {loading
            ? "Creating Account..."
            : uploadingAvatar
            ? "Uploading avatar..."
            : "Create Account"}
        </Button>

        {/* Modals */}
        <TermsModal
          open={termsOpen}
          onOpenChange={setTermsOpen}
          onAgree={() => {
            setTermsChecked(true);
            clearClientError("accepted_terms");
            setTermsOpen(false);
          }}
          onCancel={() => {
            setTermsChecked(false);
            setTermsOpen(false);
          }}
        />

        <AvatarCropper
          open={cropOpen}
          onOpenChange={setCropOpen}
          imageSrc={rawImage}
          onCancel={() => setCropOpen(false)}
          onSave={handleCropSave}
        />

        <div className="mt-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Separator className="flex-1" />
            <span>or</span>
            <Separator className="flex-1" />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}
