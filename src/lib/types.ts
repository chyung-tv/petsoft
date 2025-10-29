import { Pet } from "@prisma/client";

export type PetEssentials = Omit<
  Pet,
  "id" | "createdAt" | "updatedAt" | "userId"
>;
// userId will be assigned in the backend based on the logged-in user in server actions
