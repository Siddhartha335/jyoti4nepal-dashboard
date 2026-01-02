import {z} from "zod";

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg", "image/heic"] as const;

export const ProductSchema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    category: z.string().min(1, "Category is required."),
    image: z
        .custom<File | null>()
        .refine(
          (file) => !file || (file && ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])),
          "Only JPG, PNG, SVG, HEIC or WEBP images are allowed."
        )
        .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, "Image must be under 10MB.")
        .optional(),
    status: z.enum(["Draft", "Published"]),
    tags: z.array(z.string().min(1)).max(10, "You can add up to 10 tags.").optional(),
})

export type Product = z.infer<typeof ProductSchema>;