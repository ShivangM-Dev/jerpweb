'use server'

import { createClient } from '@supabase/supabase-js'
import { itemSchema, type ItemFormData, generateItemId } from '@/validation/item.validation'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  )
}

export async function createItemAction(data: ItemFormData, userId: string) {
  try {
    const validatedData = itemSchema.parse(data)
    
    const itemId = generateItemId()
    
    const supabase = createSupabaseClient()
    
    const { data: result, error } = await supabase
      .from('items')
      .insert({
        item_id: itemId,
        user_id: userId,
        client_id: validatedData.clientId || null,
        name: validatedData.name,
        description: validatedData.description || null,
        date: validatedData.date,
        gross_weight: parseFloat(validatedData.grossWeight),
        carate: validatedData.carate,
        net_weight: parseFloat(validatedData.netWeight),
        diamonds: validatedData.diamonds,
        stones: validatedData.stones,
        percentage: parseFloat(validatedData.percentage),
        making: validatedData.making ? parseFloat(validatedData.making) : null,
        fine: parseFloat(validatedData.fine),
        image_url: validatedData.imageUrl || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: error.message || 'Failed to create item' }
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

export async function getItemsAction(userId: string) {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        clients:client_id (
          id,
          name,
          phone
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: 'Failed to fetch items' }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching items:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getItemByIdAction(itemId: string, userId: string) {
  try {
    const supabase = createSupabaseClient()
    
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        clients:client_id (
          id,
          name,
          phone,
          email
        )
      `)
      .eq('id', itemId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: 'Failed to fetch item' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching item:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateItemAction(data: Partial<ItemFormData>, itemId: string, userId: string) {
  try {
    const validatedData = itemSchema.partial().parse(data)
    
    const supabase = createSupabaseClient()
    
    const updateData: Record<string, unknown> = {
      client_id: validatedData.clientId || null,
      name: validatedData.name,
      description: validatedData.description || null,
      date: validatedData.date,
      gross_weight: validatedData.grossWeight ? parseFloat(validatedData.grossWeight) : undefined,
      carate: validatedData.carate,
      net_weight: validatedData.netWeight ? parseFloat(validatedData.netWeight) : undefined,
      diamonds: validatedData.diamonds,
      stones: validatedData.stones,
      percentage: validatedData.percentage ? parseFloat(validatedData.percentage) : undefined,
      making: validatedData.making ? parseFloat(validatedData.making) : null,
      fine: validatedData.fine ? parseFloat(validatedData.fine) : undefined,
      image_url: validatedData.imageUrl || null,
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const { data: result, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: error.message || 'Failed to update item' }
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

export async function deleteItemAction(itemId: string, userId: string) {
  try {
    const supabase = createSupabaseClient()
    
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId)

    if (error) {
      console.error('Database error:', error)
      return { success: false, error: error.message || 'Failed to delete item' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting item:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
