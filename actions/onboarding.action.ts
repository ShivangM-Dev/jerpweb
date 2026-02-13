"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { onboardingValidation, type OnboardingFormData } from "../validation/onboarding.validation"
import { createClient } from "../utils/supabase/server"

export async function onboardingAction(formData: OnboardingFormData) {
  try {
    // Get the current user
    const user = await currentUser()
    
    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Validate the form data
    const validatedData = onboardingValidation.parse(formData)
    
    // Create Supabase client
    const supabase = await createClient()
    
    // Insert user data into the users table
    const { data, error } = await supabase
      .from('users')
      .upsert({
        clerk_id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: validatedData.name,
        phone_number: validatedData.phoneNumber,
        onboarding_completed: true,
    
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return {
        success: false,
        error: "Failed to save user data to database"
      }
    }

    console.log("User data saved successfully:", data)

    // Revalidate the home page to ensure fresh data
    revalidatePath("/home")
    
    // Redirect to the home page after successful onboarding
    redirect("/home")

  } catch (error) {
    console.error("Onboarding error:", error)
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: "An unexpected error occurred during onboarding"
    }
  }
}