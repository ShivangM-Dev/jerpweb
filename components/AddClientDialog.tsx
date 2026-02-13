'use client'

import { useState } from 'react'
import { User, Phone, Mail, Plus, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClientAction } from '@/actions/client.action'
import { type ClientFormData } from '@/validation/client.validation'
import { toast } from 'sonner'

interface AddClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClientAdded: () => void
  userId: string
  children: React.ReactNode
}

export default function AddClientDialog({ open, onOpenChange, onClientAdded, userId, children }: AddClientDialogProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^[+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    if (!userId) {
      toast.error('User not authenticated')
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await createClientAction(formData, userId)
      
      if (result.success) {
        // Reset form and close dialog
        setFormData({ name: '', email: '', phone: '' })
        setFormErrors({})
        onOpenChange(false)
        
        // Show success toast
        toast.success(`Client "${formData.name}" has been added successfully!`, {
          description: `Client ID: ${result.data.client_id}`,
          duration: 4000,
        })
        
        // Notify parent component to refresh clients
        onClientAdded()
      } else {
        toast.error(result.error || 'Failed to create client')
      }
    } catch (error) {
      console.error('Error adding client:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '' })
    setFormErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <User size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Add New Client</DialogTitle>
              <DialogDescription className="mt-1">
                Create a new client by filling in the required information below.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Separator />
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User size={16} className="text-gray-500" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  className={`h-11 ${formErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                  <Phone size={16} className="text-gray-500" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={`h-11 ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.phone}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail size={16} className="text-gray-500" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className={`h-11 ${formErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.email}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">Client ID will be auto-generated</p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">A unique 8-character ID will be assigned automatically</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-10 bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding Client...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Add Client
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}