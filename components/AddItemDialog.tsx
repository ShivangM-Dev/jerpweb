'use client'

import { useState, useRef, useEffect } from 'react'
import { Package, DollarSign, Hash, Plus, CheckCircle, Calendar, Scale, Gem, Plus as PlusIcon, Trash2, Camera, Upload, X, Search } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
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
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/nextjs'
import { toast } from 'sonner'

interface Diamond {
  id: string
  weight: string
  pieces: string
  rate: string
}

interface Stone {
  id: string
  weight: string
  pieces: string
  rate: string
}

interface Client {
  id: string
  client_id: string
  name: string
  phone: string
}

interface ItemFormData {
  name: string
  date: string
  grossWeight: string
  carate: string
  diamonds: Diamond[]
  stones: Stone[]
  netWeight: string
  percentage: string
  making: string
  fine: string
  description: string
  imageUrl: string
  clientId: string
}

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemAdded: () => void
  children: React.ReactNode
}

export default function AddItemDialog({ open, onOpenChange, onItemAdded, children }: AddItemDialogProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    date: '',
    grossWeight: '',
    carate: '',
    diamonds: [],
    stones: [],
    netWeight: '',
    percentage: '',
    making: '',
    fine: '',
    description: '',
    imageUrl: '',
    clientId: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [clients, setClients] = useState<Client[]>([])
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const { session } = useSession()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  useEffect(() => {
    if (!open) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
      setIsCameraActive(false)
      setClientSearchTerm('')
      setIsClientDropdownOpen(false)
    } else if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(console.error)
    }
  }, [open, stream, isCameraActive])

  useEffect(() => {
    async function loadClients() {
      if (!open || !session) return
      
      try {
        const supabase = createClerkSupabaseClient()
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name', { ascending: true })
        
        if (data && !error) {
          setClients(data)
        }
      } catch (err) {
        console.error('Error loading clients:', err)
      }
    }
    
    loadClients()
  }, [open, session])

  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false
      })
      
      setStream(mediaStream)
      setFacingMode(facing)
      setIsCameraActive(true)
    } catch (err) {
      toast.error('Unable to access camera. Please check permissions.')
      console.error(err)
    }
  }

  const switchCamera = () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment'
    startCamera(newFacing)
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const imageDataUrl = canvas.toDataURL('image/jpeg')
        setFormData(prev => ({ ...prev, imageUrl: imageDataUrl }))
        stopCamera()
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }))
  }

  const calculateTotalDiamondWeight = (diamonds: Diamond[]): number => {
    return diamonds.reduce((total, diamond) => {
      const weight = parseFloat(diamond.weight) || 0
      const pieces = parseFloat(diamond.pieces) || 0
      return total + (weight * pieces)
    }, 0)
  }

  const calculateTotalStoneWeight = (stones: Stone[]): number => {
    return stones.reduce((total, stone) => {
      const weight = parseFloat(stone.weight) || 0
      const pieces = parseFloat(stone.pieces) || 0
      return total + (weight * pieces)
    }, 0)
  }

  const calculateNetWeight = (grossWeight: string, diamonds: Diamond[], stones: Stone[]): string => {
    const gross = parseFloat(grossWeight) || 0
    
    const diamondWeightCarats = calculateTotalDiamondWeight(diamonds)
    const stoneWeightCarats = calculateTotalStoneWeight(stones)
    
    const diamondWeightGrams = diamondWeightCarats * 0.2
    const stoneWeightGrams = stoneWeightCarats * 0.2
    
    const netWeight = gross + diamondWeightGrams + stoneWeightGrams
    return netWeight.toFixed(3)
  }

  const normalizeDecimalInput = (value: string): string => {
    if (value.startsWith('.')) {
      return '0' + value
    }
    return value
  }

  const handleInputChange = (field: keyof ItemFormData, value: string) => {
    const normalizedValue = normalizeDecimalInput(value)
    
    setFormData(prev => {
      const newFormData = { ...prev, [field]: normalizedValue }
      
      // Auto-calculate net weight when gross weight changes
      if (field === 'grossWeight') {
        const calculatedNetWeight = calculateNetWeight(newFormData.grossWeight, newFormData.diamonds, newFormData.stones)
        newFormData.netWeight = calculatedNetWeight
        
        // Auto-calculate fine when net weight changes
        const percentage = parseFloat(newFormData.percentage) || 0
        const netWeight = parseFloat(calculatedNetWeight) || 0
        const calculatedFine = netWeight * (percentage / 100)
        newFormData.fine = calculatedFine.toFixed(2)
      }
      
      // Auto-calculate fine when percentage changes
      if (field === 'percentage') {
        const netWeight = parseFloat(newFormData.netWeight) || 0
        const percentage = parseFloat(newFormData.percentage) || 0
        const calculatedFine = netWeight * (percentage / 100)
        newFormData.fine = calculatedFine.toFixed(2)
      }
      
      return newFormData
    })
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Item name is required'
    }

    if (!formData.date.trim()) {
      errors.date = 'Date is required'
    }

    if (!formData.grossWeight.trim()) {
      errors.grossWeight = 'Gross weight is required'
    } else if (isNaN(parseFloat(formData.grossWeight)) || parseFloat(formData.grossWeight) < 0) {
      errors.grossWeight = 'Please enter a valid gross weight'
    }

    if (!formData.carate.trim()) {
      errors.carate = 'Carate is required'
    }

    if (!formData.netWeight.trim()) {
      errors.netWeight = 'Net weight is required'
    } else if (isNaN(parseFloat(formData.netWeight)) || parseFloat(formData.netWeight) < 0) {
      errors.netWeight = 'Please enter a valid net weight'
    }

    if (!formData.percentage.trim()) {
      errors.percentage = 'Percentage is required'
    } else if (isNaN(parseFloat(formData.percentage)) || parseFloat(formData.percentage) < 0) {
      errors.percentage = 'Please enter a valid percentage'
    }

    if (formData.making.trim() && (isNaN(parseFloat(formData.making)) || parseFloat(formData.making) < 0)) {
      errors.making = 'Please enter a valid making amount'
    }

    if (!formData.fine.trim()) {
      errors.fine = 'Fine is required'
    } else if (isNaN(parseFloat(formData.fine)) || parseFloat(formData.fine) < 0) {
      errors.fine = 'Please enter a valid fine amount'
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

    setIsSubmitting(true)
    
    try {
      const { data, error } = await client.from('items').insert({
        name: formData.name,
        description: formData.description,
        date: formData.date,
        gross_weight: parseFloat(formData.grossWeight),
        carate: formData.carate,
        diamonds: formData.diamonds,
        stones: formData.stones,
        net_weight: parseFloat(formData.netWeight),
        percentage: parseFloat(formData.percentage),
        making: formData.making ? parseFloat(formData.making) : null,
        fine: parseFloat(formData.fine),
        image_url: formData.imageUrl || null,
        client_id: formData.clientId || null
      }).select().single()
      
      if (error) {
        toast.error(error.message || 'Failed to create item')
        return
      }
      
      // Reset form and close dialog
      setFormData({ 
        name: '', 
        date: '',
        grossWeight: '',
        carate: '',
        diamonds: [],
        stones: [],
        netWeight: '',
        percentage: '',
        making: '',
        fine: '',
        description: '',
        imageUrl: '',
        clientId: ''
      })
      setFormErrors({})
      onOpenChange(false)
      
      // Show success toast
      toast.success(`Item "${formData.name}" has been added successfully!`, {
        description: `ID: ${data.id}`,
        duration: 4000,
      })
      
      // Notify parent component to refresh items
      onItemAdded()
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({ 
      name: '', 
      date: '',
      grossWeight: '',
      carate: '',
      diamonds: [],
      stones: [],
      netWeight: '',
      percentage: '',
      making: '',
      fine: '',
      description: '',
      imageUrl: '',
      clientId: ''
    })
    setFormErrors({})
    onOpenChange(false)
  }

  const addDiamond = () => {
    setFormData(prev => {
      const updatedDiamonds = [...prev.diamonds, {
        id: Date.now().toString(),
        weight: '',
        pieces: '',
        rate: ''
      }]
      
      // Auto-calculate net weight when diamond is added
      const calculatedNetWeight = calculateNetWeight(prev.grossWeight, updatedDiamonds, prev.stones)
      const netWeight = parseFloat(calculatedNetWeight) || 0
      const percentage = parseFloat(prev.percentage) || 0
      const calculatedFine = netWeight * (percentage / 100)
      
      return {
        ...prev,
        diamonds: updatedDiamonds,
        netWeight: calculatedNetWeight,
        fine: calculatedFine.toFixed(2)
      }
    })
  }

  const removeDiamond = (id: string) => {
    setFormData(prev => {
      const updatedDiamonds = prev.diamonds.filter(d => d.id !== id)
      
      // Auto-calculate net weight when diamond is removed
      const calculatedNetWeight = calculateNetWeight(prev.grossWeight, updatedDiamonds, prev.stones)
      const netWeight = parseFloat(calculatedNetWeight) || 0
      const percentage = parseFloat(prev.percentage) || 0
      const calculatedFine = netWeight * (percentage / 100)
      
      return {
        ...prev,
        diamonds: updatedDiamonds,
        netWeight: calculatedNetWeight,
        fine: calculatedFine.toFixed(2)
      }
    })
  }

  const updateDiamond = (id: string, field: keyof Diamond, value: string) => {
    const normalizedValue = normalizeDecimalInput(value)
    
    setFormData(prev => {
      const updatedDiamonds = prev.diamonds.map(d => 
        d.id === id ? { ...d, [field]: normalizedValue } : d
      )
      
      // Auto-calculate net weight when diamond weight or pieces changes
      if (field === 'weight' || field === 'pieces') {
        const calculatedNetWeight = calculateNetWeight(prev.grossWeight, updatedDiamonds, prev.stones)
        const netWeight = parseFloat(calculatedNetWeight) || 0
        const percentage = parseFloat(prev.percentage) || 0
        const calculatedFine = netWeight * (percentage / 100)
        
        return {
          ...prev,
          diamonds: updatedDiamonds,
          netWeight: calculatedNetWeight,
          fine: calculatedFine.toFixed(2)
        }
      }
      
      return {
        ...prev,
        diamonds: updatedDiamonds
      }
    })
  }

  const addStone = () => {
    setFormData(prev => {
      const updatedStones = [...prev.stones, {
        id: Date.now().toString(),
        weight: '',
        pieces: '',
        rate: ''
      }]
      
      // Auto-calculate net weight when stone is added
      const calculatedNetWeight = calculateNetWeight(prev.grossWeight, prev.diamonds, updatedStones)
      const netWeight = parseFloat(calculatedNetWeight) || 0
      const percentage = parseFloat(prev.percentage) || 0
      const calculatedFine = netWeight * (percentage / 100)
      
      return {
        ...prev,
        stones: updatedStones,
        netWeight: calculatedNetWeight,
        fine: calculatedFine.toFixed(2)
      }
    })
  }

  const removeStone = (id: string) => {
    setFormData(prev => {
      const updatedStones = prev.stones.filter(s => s.id !== id)
      
      // Auto-calculate net weight when stone is removed
      const calculatedNetWeight = calculateNetWeight(prev.grossWeight, prev.diamonds, updatedStones)
      const netWeight = parseFloat(calculatedNetWeight) || 0
      const percentage = parseFloat(prev.percentage) || 0
      const calculatedFine = netWeight * (percentage / 100)
      
      return {
        ...prev,
        stones: updatedStones,
        netWeight: calculatedNetWeight,
        fine: calculatedFine.toFixed(2)
      }
    })
  }

  const updateStone = (id: string, field: keyof Stone, value: string) => {
    const normalizedValue = normalizeDecimalInput(value)
    
    setFormData(prev => {
      const updatedStones = prev.stones.map(s => 
        s.id === id ? { ...s, [field]: normalizedValue } : s
      )
      
      // Auto-calculate net weight when stone weight or pieces changes
      if (field === 'weight' || field === 'pieces') {
        const calculatedNetWeight = calculateNetWeight(prev.grossWeight, prev.diamonds, updatedStones)
        const netWeight = parseFloat(calculatedNetWeight) || 0
        const percentage = parseFloat(prev.percentage) || 0
        const calculatedFine = netWeight * (percentage / 100)
        
        return {
          ...prev,
          stones: updatedStones,
          netWeight: calculatedNetWeight,
          fine: calculatedFine.toFixed(2)
        }
      }
      
      return {
        ...prev,
        stones: updatedStones
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <Package size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Add New Item</DialogTitle>
              <DialogDescription className="mt-1">
                Create a new item by filling in the required information below.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Separator />
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Package size={16} className="text-gray-500" />
                  Item Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter item name"
                  className={`h-11 ${formErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Client Select */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Search size={16} className="text-gray-500" />
                  Client
                </Label>
                <div className="relative">
                  <div className="relative">
                    <Input
                      type="text"
                      value={clientSearchTerm}
                      onChange={(e) => {
                        setClientSearchTerm(e.target.value)
                        setIsClientDropdownOpen(true)
                      }}
                      onFocus={() => setIsClientDropdownOpen(true)}
                      placeholder="Search client..."
                      className="h-11 pr-10"
                    />
                    {formData.clientId && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, clientId: '' }))
                          setClientSearchTerm('')
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  
                  {isClientDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {clients.length === 0 ? (
                        <p className="p-3 text-sm text-gray-500">No clients found</p>
                      ) : (
                        clients
                          .filter(client => 
                            client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                            client.phone?.includes(clientSearchTerm)
                          )
                          .map(client => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, clientId: client.id }))
                                setClientSearchTerm(client.name)
                                setIsClientDropdownOpen(false)
                              }}
                              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                formData.clientId === client.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                              }`}
                            >
                              <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                              <p className="text-sm text-gray-500">{client.phone}</p>
                            </button>
                          ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
                    <Calendar size={16} className="text-gray-500" />
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className={`h-11 ${formErrors.date ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.date && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.date}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="carate" className="flex items-center gap-2 text-sm font-medium">
                    <Gem size={16} className="text-gray-500" />
                    Carate *
                  </Label>
                  <select
                    id="carate"
                    value={formData.carate}
                    onChange={(e) => handleInputChange('carate', e.target.value)}
                    className={`w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${formErrors.carate ? 'border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Select Carate</option>
                    <option value="18K">18K</option>
                    <option value="14K">14K</option>
                    <option value="20K">20K</option>
                    <option value="22K">22K</option>
                  </select>
                  {formErrors.carate && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.carate}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grossWeight" className="flex items-center gap-2 text-sm font-medium">
                  <Scale size={16} className="text-gray-500" />
                  Gross Weight *
                </Label>
                <Input
                  id="grossWeight"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.grossWeight}
                  onChange={(e) => handleInputChange('grossWeight', e.target.value)}
                  placeholder="0.000"
                  className={`h-11 ${formErrors.grossWeight ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.grossWeight && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {formErrors.grossWeight}
                  </p>
                )}
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Camera size={16} className="text-gray-500" />
                  Item Image
                </Label>
                
                {formData.imageUrl ? (
                  <div className="relative border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                    <img 
                      src={formData.imageUrl} 
                      alt="Item" 
                      className="w-full h-48 object-contain rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-4 right-4 h-8 w-8 p-0 bg-white/80 dark:bg-gray-800/80"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : isCameraActive ? (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-48 object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={switchCamera}
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 dark:bg-gray-800/80"
                      >
                        <Camera size={16} className="rotate-180" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Camera size={16} className="mr-2" />
                        Capture
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={stopCamera}
                        className="h-10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 h-11"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => startCamera()}
                      className="flex-1 h-11"
                    >
                      <Camera size={16} className="mr-2" />
                      Take Photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Diamonds Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Gem size={16} className="text-gray-500" />
                    Diamonds
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDiamond}
                    className="h-8"
                  >
                    <PlusIcon size={14} className="mr-1" />
                    Add Diamond
                  </Button>
                </div>
                
                {formData.diamonds.map((diamond, index) => (
                  <div key={diamond.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Diamond {index + 1}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDiamond(diamond.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Weight"
                        value={diamond.weight}
                        onChange={(e) => updateDiamond(diamond.id, 'weight', e.target.value)}
                        className="h-9"
                      />
                      <Input
                        placeholder="Pieces"
                        value={diamond.pieces}
                        onChange={(e) => updateDiamond(diamond.id, 'pieces', e.target.value)}
                        className="h-9"
                      />
                      <Input
                        placeholder="Rate"
                        value={diamond.rate}
                        onChange={(e) => updateDiamond(diamond.id, 'rate', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                ))}
                
                {/* Total Diamond Weight Display */}
                {formData.diamonds.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Total Diamond Weight
                      </span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {calculateTotalDiamondWeight(formData.diamonds).toFixed(2)} carats
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Sum of (Weight × Pieces) for all diamonds (in carats)
                    </p>
                  </div>
                )}
              </div>

              {/* Stones Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Gem size={16} className="text-gray-500" />
                    Stones
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addStone}
                    className="h-8"
                  >
                    <PlusIcon size={14} className="mr-1" />
                    Add Stone
                  </Button>
                </div>
                
                {formData.stones.map((stone, index) => (
                  <div key={stone.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Stone {index + 1}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStone(stone.id)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Weight"
                        value={stone.weight}
                        onChange={(e) => updateStone(stone.id, 'weight', e.target.value)}
                        className="h-9"
                      />
                      <Input
                        placeholder="Pieces"
                        value={stone.pieces}
                        onChange={(e) => updateStone(stone.id, 'pieces', e.target.value)}
                        className="h-9"
                      />
                      <Input
                        placeholder="Rate"
                        value={stone.rate}
                        onChange={(e) => updateStone(stone.id, 'rate', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                ))}
                
                {/* Total Stone Weight Display */}
                {formData.stones.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Total Stone Weight
                      </span>
                      <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                        {calculateTotalStoneWeight(formData.stones).toFixed(2)} carats
                      </span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Sum of (Weight × Pieces) for all stones (in carats)
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="netWeight" className="flex items-center gap-2 text-sm font-medium">
                    <Scale size={16} className="text-gray-500" />
                    Net Weight (Auto-calculated) *
                  </Label>
                  <Input
                    id="netWeight"
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.netWeight}
                    onChange={(e) => handleInputChange('netWeight', e.target.value)}
                    placeholder="0.000"
                    className={`h-11 ${formErrors.netWeight ? 'border-red-500 focus:ring-red-500' : ''}`}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Calculated: Gross Weight + (Diamonds + Stones) × 0.2
                  </p>
                  {formErrors.netWeight && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.netWeight}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="percentage" className="flex items-center gap-2 text-sm font-medium">
                    <Hash size={16} className="text-gray-500" />
                    Percentage (%) *
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.percentage}
                    onChange={(e) => handleInputChange('percentage', e.target.value)}
                    placeholder="0.00"
                    className={`h-11 ${formErrors.percentage ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.percentage && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.percentage}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="making" className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign size={16} className="text-gray-500" />
                    Making
                  </Label>
                  <Input
                    id="making"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.making}
                    onChange={(e) => handleInputChange('making', e.target.value)}
                    placeholder="0.00"
                    className={`h-11 ${formErrors.making ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.making && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.making}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fine" className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign size={16} className="text-gray-500" />
                    Fine (Auto-calculated)
                  </Label>
                  <Input
                    id="fine"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fine}
                    onChange={(e) => handleInputChange('fine', e.target.value)}
                    placeholder="0.00"
                    className={`h-11 ${formErrors.fine ? 'border-red-500 focus:ring-red-500' : ''}`}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Calculated: Net Weight × (Percentage/100)
                  </p>
                  {formErrors.fine && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {formErrors.fine}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter item description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">Item will be added to inventory</p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">The item will be available immediately after creation</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4 shrink-0">
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
                  Adding Item...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}