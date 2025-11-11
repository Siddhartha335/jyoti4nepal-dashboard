import {z} from "zod";

export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] as const;

// For browser File validation
const isFileValid = (file: any): file is File => {
  return file instanceof File;
};

export const TeamSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters."),
  image: z
    .any()
    .refine((file) => {
      if (!file) return false; // Image is required
      return isFileValid(file);
    }, "Please upload an image file.")
    .refine((file) => {
      if (!file) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Only JPG, PNG, SVG or WEBP images are allowed.")
    .refine((file) => {
      if (!file) return true;
      return file.size <= MAX_IMAGE_SIZE;
    }, "Image must be under 4MB.")
    .optional(),
  role: z.string().min(1, "Role is required."),
  status: z.enum(["Draft", "Published"]),
});

export type Team = z.infer<typeof TeamSchema>;