'use server'

import { createClient } from '@supabase/supabase-js'
import { clientSchema, type ClientFormData, generateClientId } from '@/validation/client.validation'

// Create a Supabase client for server-side operations
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  )
}

export async function createClientAction(data: ClientFormData, userId: string) {
  try {
    // Validate the input data
    const validatedData = clientSchema.parse(data)
    
    // Generate a unique client_id
    const clientId = generateClientId()
    
    const supabase = createSupabaseClient()
    
    // Insert the client with user_id and client_id
    const { data: result, error } = await supabase
      .from('clients')
      .insert({
        client_id: clientId,
        user_id: userId,
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: 'Failed to create client' }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Validation error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getClientsAction(userId: string) {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: 'Failed to fetch clients' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching clients:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}