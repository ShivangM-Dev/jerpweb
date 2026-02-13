'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, Image, Download, Trash2, AlertCircle } from 'lucide-react'

interface Photo {
  id: string
  url: string
  name: string
  created_at: string
}

export default function CameraPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setIsCameraActive(true)
    } catch (err) {
      setError('Unable to access camera. Please check permissions.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
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
        setCapturedImage(imageDataUrl)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const savePhoto = async () => {
    if (!capturedImage) return
    
    setLoading(true)
    try {
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      const filename = `photo-${Date.now()}.jpg`
      
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: capturedImage,
        name: filename,
        created_at: new Date().toISOString()
      }
      
      setPhotos(prev => [newPhoto, ...prev])
      setCapturedImage(null)
      stopCamera()
    } catch (err) {
      setError('Failed to save photo')
      console.error('Save error:', err)
    } finally {
      setLoading(false)
    }
  }

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id))
  }

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Camera size={24} />
          Camera
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="relative aspect-video bg-gray-900 dark:bg-gray-950">
              {!isCameraActive && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-400 dark:text-gray-500 mb-4">No camera active</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={startCamera}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Camera size={20} />
                        Start Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Upload size={20} />
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isCameraActive && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <button
                      onClick={capturePhoto}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
                    >
                      <Camera size={24} />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors shadow-lg"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </>
              )}

              {capturedImage && (
                <>
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <button
                      onClick={savePhoto}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Download size={20} />
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={20} />
                      Discard
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Image size={20} />
            Recent Photos
          </h2>
          
          {photos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Image size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No photos yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Take a photo or upload an image to get started</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group">
                  <div className="aspect-video relative">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadPhoto(photo)}
                          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{photo.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(photo.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}