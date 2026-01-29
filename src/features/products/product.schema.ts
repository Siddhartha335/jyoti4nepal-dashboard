import { z } from "zod";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg", 
  "image/png", 
  "image/webp", 
  "image/svg+xml", 
  "image/heic",
  "image/heif"
] as const;

export const ProductSchema = z.object({
  name: z.string().min(5, "Name must be at least 5 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category: z.string().min(1, "Category is required."),
  // Changed from image to images array
  images: z
    .array(z.custom<File>())
    .refine(
      (files) => files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type as any) || file.name.toLowerCase().endsWith('.heic')),
      "Some files have unsupported formats."
    )
    .refine(
      (files) => files.every((file) => file.size <= MAX_IMAGE_SIZE),
      "Each image must be under 10MB."
    ),
  status: z.enum(["Draft", "Published"]),
  tags: z.array(z.string()).max(10, "Max 10 tags allowed"),
});

export type Product = z.infer<typeof ProductSchema>;