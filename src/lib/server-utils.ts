import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import prisma from "./db";
import { Pet, User } from "@prisma/client";

export async function checkAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function getPetById(petId: Pet["id"]) {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    // can only select userId field to return using select argument, skipped here
  });
  return pet;
}

export async function getPetsByUserId(userId: User["id"]) {
  const pets = await prisma.pet.findMany({
    where: { userId },
    // can only select userId field to return using select argument, skipped here
  });
  return pets;
}

export async function getUserByEmail(email: User["email"]) {
  const user = await prisma.user.findUnique({ where: { email } });

  return user;
}
