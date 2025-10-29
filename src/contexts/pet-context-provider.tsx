"use client";

import { addPet, deletePet, editPet } from "@/actions/actions";
import { createContext, useOptimistic, useState } from "react";
import { toast } from "sonner";
import { Pet } from "@prisma/client";
import { PetEssentials } from "@/lib/types";

type PetContextProviderProps = {
  data: Pet[];
  children: React.ReactNode;
};

type TPetContext = {
  pets: Pet[];
  selectedPetId: Pet["id"] | null;
  handleChangeSelectedPetId: (id: string) => void;
  selectedPet: Pet | null;
  numberOfPets: number;
  handleCheckoutPet: (id: Pet["id"]) => Promise<void>;
  handleAddPet: (newPet: PetEssentials) => Promise<void>;
  handleEditPet: (petId: Pet["id"], updatedPet: PetEssentials) => Promise<void>;
};

export const PetContext = createContext<TPetContext | null>(null);

export function PetContextProvider({
  data,
  children,
}: PetContextProviderProps) {
  // state
  const [optimisticPets, setOptimisticPets] = useOptimistic(
    data,
    (prev, { action, payload }) => {
      switch (action) {
        case "add":
          const newPet: Pet = {
            id: Math.random().toString(36).substring(2, 9), // generate a random id
            ...payload,
          };
          return [newPet, ...prev];
        case "edit":
          const { petId, newPetData } = payload;
          return prev.map((pet) =>
            pet.id === petId ? { ...pet, ...newPetData } : pet
          );
        case "delete":
          return prev.filter((pet) => pet.id !== payload);
        default:
          return prev;
      }
    }
  );

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  //derive state
  const selectedPet =
    optimisticPets.find((pet) => pet.id === selectedPetId) || null;
  const numberOfPets = optimisticPets.length;
  //handlers
  const handleChangeSelectedPetId = (id: Pet["id"]) => {
    setSelectedPetId(id);
  };
  const handleCheckoutPet = async (petId: Pet["id"]) => {
    setOptimisticPets({
      action: "delete",
      payload: petId,
    });
    const error = await deletePet(petId);
    if (error) {
      toast.warning(error.message);
      return;
    } // you can handle error better by showing in the form instead of alert
    setSelectedPetId(null);
  };
  const handleAddPet = async (newPetData: PetEssentials) => {
    setOptimisticPets({
      action: "add",
      payload: newPetData,
    });

    const error = await addPet(newPetData);
    if (error) {
      toast.warning(error.message);
      return;
    } // you can handle error better by showing in the form instead of alert
  };

  const handleEditPet = async (petId: Pet["id"], newPetData: PetEssentials) => {
    setOptimisticPets({
      action: "edit",
      payload: { petId, newPetData },
    });
    const error = await editPet(petId, newPetData);
    if (error) {
      toast.warning(error.message);
      return;
    } // you can handle error better by showing in the form instead of alert
  };

  return (
    <PetContext.Provider
      value={{
        pets: optimisticPets,
        selectedPetId,
        handleChangeSelectedPetId,
        selectedPet,
        numberOfPets,
        handleCheckoutPet,
        handleAddPet,
        handleEditPet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}
