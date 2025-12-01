import { z } from "zod";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; 
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"] as const;
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"] as const;
export const ACCEPTED_MEDIA_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES] as const;

// Schema
export const PopupSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Promotion", "Announcement", "Newsletter", "Discount"]),
  content: z.string().min(1, "Content is required"),
  buttonText: z.string().min(1, "Button text is required"),
  buttonLink: z.string().url("Must be a valid URL"),
  media: z
      .custom<File | null>()
      .refine(
        (file) => !file || (file && ACCEPTED_MEDIA_TYPES.includes(file.type as typeof ACCEPTED_MEDIA_TYPES[number])),
        "Only JPG, PNG, SVG, WEBP images or MP4, WEBM, OGG videos are allowed."
      )
      .refine((file) => !file || file.size <= MAX_FILE_SIZE, "File must be under 10MB.")
      .optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["Published", "Draft"]),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

export type PopupFormValues = z.infer<typeof PopupSchema>;