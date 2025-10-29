"use client";

import React from "react";
import { Button } from "./ui/button";
import { useFormStatus } from "react-dom";

export default function AuthFormBtn({ type }: { type: "logIn" | "signUp" }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending}>
      {type === "logIn" ? "Log In" : "Sign Up"}
    </Button>
  );
}
