"use client";
import { logIn, signUp } from "@/actions/actions";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import AuthFormBtn from "./auth-form-btn";
import { useFormState } from "react-dom";

export default function AuthForm({ type }: { type: "logIn" | "signUp" }) {
  const [signUpError, dispatchSignUp] = useFormState(signUp, undefined);
  const [logInError, dispatchLogIn] = useFormState(logIn, undefined);

  // why are we not using RHF?
  return (
    // got this weird action error when I refactored the action functions to accept unknown instead of FormData
    // do not know why tho, BG has no this issue
    <form
      action={type === "logIn" ? dispatchLogIn : dispatchSignUp}
      className="max-w-sm"
    >
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          name="email"
          id="email"
          required
          className="border-zinc-400"
        />
      </div>
      <div className="space-y-1 mt-2 mb-4">
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          name="password"
          id="password"
          required
          className="border-zinc-400"
        />
        <AuthFormBtn type={type} />

        {signUpError && (
          <p className="text-red-500 text-sm mt-2">{signUpError.message}</p>
        )}
        {logInError && (
          <p className="text-red-500 text-sm mt-2">{logInError.message}</p>
        )}
      </div>
    </form>
  );
}
