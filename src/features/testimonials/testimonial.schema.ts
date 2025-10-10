import { z } from "zod";

export const TESTIMONIAL_ROLES = ["Customer", "Partner", "Donor", "Volunteer"] as const;
export const TESTIMONIAL_STATUSES = ["Pending", "Approved"] as const;

export const TestimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  role: z.enum(TESTIMONIAL_ROLES, {
    message: "Please select a role.",
  }),
  roleNote: z
    .string()
    .max(120, "Keep it under 120 characters.")
    .optional()
    .or(z.literal("")),
  content: z.string().min(10, "Testimonial must be at least 10 characters."),
  rating: z.number().min(1, "Please provide a rating.").max(5),
  status: z.enum(TESTIMONIAL_STATUSES, {
    message: "Please choose a status.",
  }),
  featured: z.boolean(),
});

export type TestimonialForm = z.infer<typeof TestimonialSchema>;