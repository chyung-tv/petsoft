"use server";

import { signIn, signOut } from "@/lib/auth-no-edge";
import prisma from "@/lib/db";
import { authSchema, petFormSchema, petIdSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { checkAuth, getPetById } from "@/lib/server-utils";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";

// wtf is this stripe import syntax???
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// user action
export async function logIn(prev: unknown, formData: unknown) {
  // useFormState passes two arguments, first is previous state, second is the form data, need to accept both even if we don't use the first one
  if (!formData || !(formData instanceof FormData)) {
    return {
      message: "Invalid form data",
    };
  }

  try {
    await signIn("credentials", formData);
    // signIn when successful redirects automatically, that is achieved by throwing an error internally in next-auth; and here we will catch it to handle as error
    //somehow the sign in function works with formdata directly???
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return { message: "Invalid email or password" };
        }
        default: {
          return { message: "An unknown error occurred" };
        }
      }
    }
    throw error; // nextjs redirect throws error, so we need to re-throw unexpected errors
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function signUp(prev: unknown, formData: unknown) {
  // screen for FormData Type
  if (!formData || !(formData instanceof FormData)) {
    return {
      message: "Invalid form data",
    };
  }
  // conversion to object
  const formDataEntries = Object.fromEntries(formData.entries());

  // validation
  const validatedFormData = authSchema.safeParse(formDataEntries);
  if (!validatedFormData.success) {
    return {
      message: "Validation failed",
    };
  }
  const { email, password } = validatedFormData.data;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Unique constraint failed
        return {
          message: "Email already in use.",
        };
      }
    }
  }
  await signIn("credentials", formData); //somehow the sign in function works with formdata directly??? and we do need to pass formdata again here
}

// pet crud
export async function addPet(pet: unknown) {
  // check user session
  const session = await checkAuth();

  //server side validation
  const validatedPet = petFormSchema.safeParse(pet);
  if (!validatedPet.success) {
    return {
      message: "Validation failed",
    };
  }

  try {
    await prisma.pet.create({
      data: {
        ...validatedPet.data,
        user: {
          connect: { id: session.user.id }, // associate pet with logged-in user
          // if no user, will be orphaned. But checkAuth ensures user exists, still type issue. so we declare in next-auth.d.ts that user has an id. only do if you are sure!
        },
      },
    });
  } catch (error) {
    return {
      message: "Failed to add pet",
    };
  }
  revalidatePath("/app", "layout"); //revalidate the page
}

export async function editPet(petId: unknown, newPetData: unknown) {
  // check user session
  const session = await checkAuth();

  // validation
  const validatedPet = petFormSchema.safeParse(newPetData);
  const validatedPetId = petIdSchema.safeParse(petId);
  if (!validatedPet.success || !validatedPetId.success) {
    return {
      message: "Validation failed",
    };
  }

  // check authorization
  const pet = await getPetById(validatedPetId.data);
  if (!pet) {
    return { message: "Pet not found" };
  }
  if (pet.userId !== session.user.id) {
    return {
      message: "Unauthorized to edit this pet",
    };
  }

  //db mutation
  try {
    await prisma.pet.update({
      where: { id: validatedPetId.data },
      data: validatedPet.data,
    });
  } catch (error) {
    return {
      message: "Failed to edit pet",
    };
  }
  revalidatePath("/app", "layout"); //revalidate the page
}

export async function deletePet(petId: unknown) {
  // verify authentication
  const session = await checkAuth();

  // server side validation
  const validatedPetId = petIdSchema.safeParse(petId);
  if (!validatedPetId.success) {
    return {
      message: "Validation failed",
    };
  }

  // authorization: ensure the pet belongs to the logged-in user
  // check the userid associated with the pet id
  const pet = await getPetById(validatedPetId.data);
  if (!pet) {
    return { message: "Pet not found" };
  }
  if (pet.userId !== session.user.id) {
    return {
      message: "Unauthorized to delete this pet",
    };
  }

  // db mutation
  try {
    await prisma.pet.delete({
      where: { id: validatedPetId.data },
    });
  } catch (error) {
    return {
      message: "Failed to delete pet",
    };
  }
  revalidatePath("/app", "layout"); //revalidate the page
}

// payment action
// stripe type any bc stripe lib has no typescript support???
export async function createCheckoutSession() {
  // verify authentication
  const session = await checkAuth();
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [{ price: "price_1SNQQWHRxwM2frQEQDDBileg", quantity: 1 }],
    mode: "payment",
    success_url: `${process.env.CANONICAL_URL}/payment?success=true`,
    cancel_url: `${process.env.CANONICAL_URL}/payment?canceled=true`,
  });
  redirect(checkoutSession.url);
}
