import { useCallback, useState } from 'react'
import { Upload, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
  maxSizeMB?: number
  acceptedTypes?: string[]
}

export const FileUpload = ({ 
  onUpload, 
  isUploading = false,
  maxSizeMB = 10,
  acceptedTypes,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxSize = maxSizeMB * 1024 * 1024

  const validateFile = useCallback((file: File): string | null => {
    // Vérifier la taille
    if (file.size === 0) {
      return 'Le fichier ne peut pas être vide'
    }
    if (file.size > maxSize) {
      return `La taille du fichier ne peut pas dépasser ${maxSizeMB}MB`
    }

    // Vérifier le type si spécifié
    if (acceptedTypes && acceptedTypes.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const fileType = file.type
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase()
        }
        return fileType.match(new RegExp(type.replace('*', '.*')))
      })

      if (!isAccepted) {
        return `Type de fichier non accepté. Types acceptés: ${acceptedTypes.join(', ')}`
      }
    }

    return null
  }, [maxSize, maxSizeMB, acceptedTypes])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      setError(null)

      const file = e.dataTransfer.files[0]
      if (file) {
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
        try {
          await onUpload(file)
        } catch {
          setError('Échec du téléchargement du fichier')
        }
      }
    },
    [onUpload, validateFile]
  )

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        e.target.value = ''
        return
      }
      try {
        await onUpload(file)
      } catch {
        setError('Échec du téléchargement du fichier')
      }
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all duration-300',
          isDragging
            ? 'border-primary bg-primary-50 scale-105'
            : error
            ? 'border-destructive bg-destructive/5'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50',
          isUploading && 'pointer-events-none opacity-50'
        )}
      >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
        accept={acceptedTypes?.join(',')}
      />

      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300',
            isDragging ? 'bg-primary text-white scale-110' : 'bg-primary-100 text-primary'
          )}
        >
          {isUploading ? (
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className={cn('w-8 h-8', isDragging && 'animate-bounce')} />
          )}
        </div>

        <p className="text-lg font-semibold text-gray-700 mb-1">
          {isUploading
            ? 'Téléchargement en cours...'
            : isDragging
            ? 'Déposez votre fichier ici'
            : 'Glissez-déposez ou cliquez'}
        </p>
        <p className="text-sm text-gray-500">
          {isUploading ? 'Veuillez patienter' : 'Tous types de fichiers acceptés'}
        </p>
      </label>

      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none" />
      )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}
