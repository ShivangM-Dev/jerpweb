'use client'

import { useState, useEffect } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { Package, Plus, Search, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import AddItemDialog from '@/components/AddItemDialog'

interface Diamond {
  weight: number
  pieces: number
  rate: number
}

interface Stone {
  weight: number
  pieces: number
  rate: number
}

interface Item {
  id: string
  name: string
  description: string
  date: string
  gross_weight: number
  carate: string
  diamonds: Diamond[]
  stones: Stone[]
  net_weight: number
  percentage: number
  making: number | null
  fine: number
  created_at: string
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { user } = useUser()
  const { session } = useSession()

  function createClerkSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        async accessToken() {
          return session?.getToken() ?? null
        },
      },
    )
  }

  const client = createClerkSupabaseClient()

  useEffect(() => {
    if (!user) return
    loadItems()
  }, [user])

  async function loadItems() {
    setLoading(true)
    const { data, error } = await client.from('items').select('*').order('created_at', { ascending: false })
    if (!error) setItems(data || [])
    setLoading(false)
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package size={24} />
          Items
        </h1>
        <AddItemDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          onItemAdded={loadItems}
        >
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg">
            <Plus size={20} className="mr-2" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </AddItemDialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <Package size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No items found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{item.name}</h3>
              {item.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{item.description}</p>
              )}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Carate:</span>
                    <span className="font-medium ml-1 text-gray-900 dark:text-white">{item.carate}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Date:</span>
                    <span className="font-medium ml-1 text-gray-900 dark:text-white">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Gross:</span>
                    <span className="font-medium ml-1 text-gray-900 dark:text-white">{item.gross_weight.toFixed(3)}g</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Net:</span>
                    <span className="font-medium ml-1 text-gray-900 dark:text-white">{item.net_weight.toFixed(3)}g</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Diamonds:</span>
                    <span className="font-medium ml-1 text-gray-900 dark:text-white">{item.diamonds.length}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Stones:</span>
                    <span className="font-medium ml-1 text-gray-900 dark:text-white">{item.stones.length}</span>
                  </div>
                </div>
                <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                  ${item.fine.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}