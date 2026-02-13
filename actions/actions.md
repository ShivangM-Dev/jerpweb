# Server Actions Documentation

This folder contains all server actions used throughout the JERP application. Server actions are functions that run on the server side and can be called from client components.

## File Naming Convention

All action files follow the pattern: `{actionName}.action.ts`

## Available Actions

### `onboarding.action.ts`

**Purpose**: Handles the user onboarding process after initial authentication.

**Function**: `onboardingAction(formData: OnboardingFormData)`

**Description**:
- Processes user onboarding data (name and phone number)
- Validates the input data using Zod schema
- Authenticates the current user using Clerk
- Logs the onboarding data (production version should save to database)
- Redirects user to `/home` after successful onboarding

**Parameters**:
```typescript
{
  name: string;          // User's full name (2-50 characters)
  phoneNumber: string;    // Phone number (10-15 digits, formatted)
}
```

**Validation Rules**:
- **name**: Must be 2-50 characters long
- **phoneNumber**: Must be 10-15 digits and match phone number format

**Returns**:
- On success: Redirects to `/home`
- On failure: Returns `{ success: false, error: string }`

**Usage Example**:
```typescript
import { onboardingAction } from "@/actions/onboarding.action"

// In a form component
const result = await onboardingAction({
  name: "John Doe",
  phoneNumber: "+1234567890"
})
```

**Authentication**: Requires authenticated user (uses Clerk)

**Error Handling**:
- Catches and returns authentication errors
- Handles validation errors
- Provides meaningful error messages to users

---

## Adding New Actions

When creating new server actions, follow these guidelines:

1. **File Naming**: Use `{actionName}.action.ts` format
2. **TypeScript**: Always include proper type definitions
3. **Validation**: Validate all input data using Zod schemas
4. **Authentication**: Check user authentication when required
5. **Error Handling**: Provide clear error messages
6. **Documentation**: Update this file with your new action

### Template for New Actions:

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { z } from "zod"

// Define validation schema
const yourActionValidation = z.object({
  // your validation rules
})

// Define type for form data
type YourActionFormData = z.infer<typeof yourActionValidation>

// Export the action function
export async function yourActionAction(formData: YourActionFormData) {
  try {
    // Get current user
    const user = await currentUser()
    
    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated"
      }
    }

    // Validate input data
    const validatedData = yourActionValidation.parse(formData)
    
    // Process your logic here
    console.log("Processing action:", {
      userId: user.id,
      data: validatedData
    })

    // Revalidate paths if needed
    revalidatePath("/your-path")
    
    // Redirect if needed
    redirect("/success-page")

  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: "An unexpected error occurred"
    }
  }
}
```

---

## Security Considerations

- Always validate user authentication when dealing with user-specific data
- Use Zod schemas for all input validation
- Never trust client-side data alone
- Implement proper error handling to prevent information leakage
- Use `revalidatePath()` appropriately to update cached data

## Performance Considerations

- Server actions run on the server, so keep them efficient
- Avoid unnecessary database queries
- Use caching where appropriate
- Consider the impact on server response times

---

*Last Updated: February 2026*