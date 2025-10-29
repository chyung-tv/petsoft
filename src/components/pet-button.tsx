"use client";

import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import PetForm from "./pet-form";
import { useState } from "react";
import { flushSync } from "react-dom";

type PetButtonProps = {
  actionType: "add" | "edit" | "checkout";
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export default function PetButton({
  actionType,
  children,
  disabled,
  onClick,
}: PetButtonProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  if (actionType === "checkout") {
    return (
      <Button variant={"secondary"} onClick={onClick} disabled={disabled}>
        {children}
      </Button>
    );
  }
  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        {/* not adding asChild will make a button in button causing hydration error
        hydration error usually have somthing to do with a conflicting html sstructure after render */}
        {actionType === "add" ? (
          <Button size="icon">
            <PlusIcon className="!w-6 !h-6" />
            {/* seems like lucide has conflicting and overriding css, so i added ! here*/}
          </Button>
        ) : (
          <Button variant={"secondary"}>{children}</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionType === "add" ? "Add a new pet" : "Edit Pet"}
          </DialogTitle>
        </DialogHeader>
        <PetForm
          actionType={actionType}
          onFormSubmission={() =>
            flushSync(() => {
              setIsFormOpen(false);
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
}
