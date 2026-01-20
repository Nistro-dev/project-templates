import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useAuth, useToast } from '@/hooks'
import { fileService } from '@/services/files'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileUpload } from '@/components/FileUpload'
import { Loading } from '@/components/ui/loading'
import { Trash2, Download, LogOut, User, Settings, FileText, HardDrive, TrendingUp, Files } from 'lucide-react'
import type { FileItem } from '@/types'

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user)
  const { logout } = useAuth()
  const { toast } = useToast()
  
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const loadFiles = async () => {
    setIsLoading(true)
    try {
      const data = await fileService.list()
      setFiles(data)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec du chargement des fichiers',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    try {
      await fileService.upload(file)
      toast({
        title: 'Succès',
        description: 'Fichier téléchargé avec succès',
      })
      await loadFiles()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec du téléchargement',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const url = await fileService.getDownloadUrl(file.id)
      window.open(url, '_blank')
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec de la récupération du lien',
      })
    }
  }

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Supprimer ${file.filename} ?`)) return

    try {
      await fileService.remove(file.id)
      toast({
        title: 'Succès',
        description: 'Fichier supprimé avec succès',
      })
      await loadFiles()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Échec de la suppression',
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const totalSize = files.reduce((acc, file) => acc + file.size, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Files className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Tableau de bord
                </h1>
                <p className="text-sm text-gray-500">Gérez vos fichiers</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-4 py-2 transition-all duration-300 hover-lift">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Avatar
                    fallback={`${user?.firstName} ${user?.lastName}`}
                    size="md"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-semibold">Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card hover className="animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total fichiers</p>
                  <p className="text-2xl font-bold text-gray-900">{files.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center shadow-md">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Espace utilisé</p>
                  <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-glow-pink">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Ce mois-ci</p>
                  <p className="text-2xl font-bold text-gray-900">{files.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Télécharger un fichier</CardTitle>
            <CardDescription>Glissez-déposez ou cliquez pour sélectionner</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onUpload={handleUpload} isUploading={isUploading} />
          </CardContent>
        </Card>

        {/* Files List */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Mes fichiers</CardTitle>
                <CardDescription>
                  {files.length} fichier{files.length !== 1 ? 's' : ''} au total
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12">
                <Loading size="lg" text="Chargement des fichiers..." />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">Aucun fichier</p>
                <p className="text-sm text-gray-500">Commencez par télécharger votre premier fichier</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className="group flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary-50/50 transition-all duration-300 hover-lift animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                          {file.filename}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file)}
                        className="hover:bg-primary-100 hover:text-primary"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}