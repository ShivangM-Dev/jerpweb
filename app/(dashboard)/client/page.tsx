'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Users, Plus, Search, Phone, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getClientsAction } from '@/actions/client.action'
import AddClientDialog from '@/components/AddClientDialog'

interface Client {
  id: string
  client_id: string
  name: string
  email: string | null
  phone: string
  user_id: string
  created_at: string
}

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { user } = useUser()

  useEffect(() => {
    if (!user?.id) return

    async function loadClients() {
      setLoading(true)
const result = await getClientsAction(user!.id)
      if (result.success) {
        setClients(result.data || [])
      } else {
        console.error('Failed to load clients:', result.error)
        setClients([])
      }
      setLoading(false)
    }

    loadClients()
  }, [user?.id])

  const handleClientAdded = async () => {
    if (!user?.id) return
    
    // Reload clients after adding a new one
    const result = await getClientsAction(user.id)
    if (result.success) {
      setClients(result.data || [])
    } else {
      console.error('Failed to reload clients:', result.error)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users size={24} />
          Clients
        </h1>
        
        <AddClientDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onClientAdded={handleClientAdded}
          userId={user?.id || ''}
        >
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg">
            <Plus size={20} className="mr-2" />
            <span className="hidden sm:inline">Add Client</span>
          </Button>
        </AddClientDialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-8">
          <Users size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No clients found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                      {client.client_id && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          ID: {client.client_id}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator className="mb-3" />
                
                <div className="space-y-2">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone size={14} />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail size={14} />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}