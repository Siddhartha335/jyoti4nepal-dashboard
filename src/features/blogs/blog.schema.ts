import { z } from "zod";

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const BlogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z
    .string()
    .max(200, "Description must be 200 characters or less.")
    .optional()
    .or(z.literal("")),
  content: z.string().min(20, "Content must be at least 20 characters."),
  status: z.enum(["Draft", "Published", "Scheduled"]),
  tags: z.array(z.string().min(1)).max(10, "You can add up to 10 tags.").optional(),
  cover: z
    .custom<File | null>()
    .refine(
      (file) => !file || (file && ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])),
      "Only JPG, PNG, or WEBP images are allowed."
    )
    .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, "Image must be under 2MB.")
    .optional(),
});

export type BlogFormValues = z.infer<typeof BlogSchema>;
