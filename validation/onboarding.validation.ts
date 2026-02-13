import { z } from "zod"

export const onboardingValidation = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^[+]?[\d\s\-\(\)]+$/, "Invalid phone number format"),
})

export type OnboardingFormData = z.infer<typeof onboardingValidation>