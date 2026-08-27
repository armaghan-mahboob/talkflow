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

function SignIn() {
  const [otpSent, setOtpSent] = useState(false);
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
            onSubmit={(e) => {
              e.preventDefault();
              setOtpSent(true);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>

              <Input id="phone" type="tel" placeholder="+92 300 1234567" />
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
              <InputOTP maxLength={4}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="button"
              className="w-full max-w-2/5 mx-auto block min-h-10"
            >
              Verify OTP
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
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
          >
            Sign Up
          </button>
        </div>
      </div>
    </main>
  );
}

export default SignIn;
