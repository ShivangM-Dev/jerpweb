import { z } from 'zod'

const diamondSchema = z.object({
  id: z.string(),
  weight: z.string().optional(),
  pieces: z.string().optional(),
  rate: z.string().optional(),
})

const stoneSchema = z.object({
  id: z.string(),
  weight: z.string().optional(),
  pieces: z.string().optional(),
  rate: z.string().optional(),
})

export const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200, 'Name must be less than 200 characters'),
  date: z.string().min(1, 'Date is required'),
  grossWeight: z.string().min(1, 'Gross weight is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Gross weight must be a positive number'
  ),
  carate: z.string().min(1, 'Carate is required'),
  netWeight: z.string().min(1, 'Net weight is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    'Net weight must be a positive number'
  ),
  percentage: z.string().min(1, 'Percentage is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Percentage must be 0 or greater'
  ),
  making: z.string().optional(),
  fine: z.string().min(1, 'Fine is required').refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    'Fine must be 0 or greater'
  ),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  clientId: z.string().optional(),
  diamonds: z.array(diamondSchema).default([]),
  stones: z.array(stoneSchema).default([]),
})

export type ItemFormData = z.infer<typeof itemSchema>

export function generateItemId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ITEM-${timestamp}-${randomPart}`
}
