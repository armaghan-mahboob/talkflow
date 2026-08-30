import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignIn() {
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerifyOtp = async () => {
    setError("");

    if (otp.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            otp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/chat");
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server");
    }
  };

  const handleResendOtp = async () => {
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      setOtp("");
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server");
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Logo />

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your phone number
          </p>
        </div>

        {!otpSent ? (
          <form
            className="mt-8 space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();

              setError("");

              try {
                const response = await fetch(
                  "http://localhost:5000/api/auth/send-otp",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      phone,
                    }),
                  },
                );

                const data = await response.json();

                if (!response.ok) {
                  setError(data.message);
                  return;
                }

                setOtpSent(true);
              } catch (error) {
                console.error(error);

                setError("Unable to connect to the server");
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>

              <Input
                id="phone"
                type="tel"
                placeholder="Enter your registered phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button
              type="submit"
              className="w-full max-w-2/5 mx-auto block min-h-10"
            >
              Send OTP
            </Button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                Verify your phone number
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Enter the 4-digit code sent to your phone
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError("");
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <Button type="button" className="w-full" onClick={handleVerifyOtp}>
              Verify OTP
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            </p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </main>
  );
}

export default SignIn;
