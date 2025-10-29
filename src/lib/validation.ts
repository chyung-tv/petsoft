import { z } from "zod";
import { DEFAULT_PET_IMG } from "./constants";

export const petIdSchema = z.string().cuid();

export type TPetForm = z.infer<typeof petFormSchema>;
// zod validaition schema: i need to get (sth) of (someshape)
export const petFormSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Name is required" }).max(100),
    ownerName: z
      .string()
      .trim()
      .min(1, { message: "Owner Name is required" })
      .max(100),
    imageUrl: z
      .string()
      .trim()
      .url({ message: "Invalid URL" })
      .or(z.literal("")),
    age: z.coerce
      .number({ invalid_type_error: "Age must be a number" })
      .int()
      .positive()
      .max(999),
    notes: z.string().trim().max(500).or(z.literal("")),
  })
  .transform((data) => ({
    ...data,
    imageUrl: data.imageUrl || DEFAULT_PET_IMG,
  }));

export const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});
