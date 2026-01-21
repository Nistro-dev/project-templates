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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="glass-strong backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center glow">
                <Files className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-gradient">
                  Tableau de bord
                </h1>
                <p className="text-sm text-gray-400">Gérez vos fichiers</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-white/5 rounded-xl px-4 py-2 transition-all duration-300 hover-lift">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-300">
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
                <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-400">
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
          <Card hover className="animate-fade-in-up glass border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center glow">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Total fichiers</p>
                  <p className="text-2xl font-bold text-white">{files.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover className="animate-fade-in-up glass border-white/10" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <HardDrive className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Espace utilisé</p>
                  <p className="text-2xl font-bold text-white">{formatFileSize(totalSize)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover className="animate-fade-in-up glass border-white/10" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center glow-pink">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Ce mois-ci</p>
                  <p className="text-2xl font-bold text-white">{files.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 animate-fade-in-up glass border-white/10" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Télécharger un fichier</CardTitle>
            <CardDescription className="text-gray-400">Glissez-déposez ou cliquez pour sélectionner</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onUpload={handleUpload} isUploading={isUploading} />
          </CardContent>
        </Card>

        {/* Files List */}
        <Card className="animate-fade-in-up glass border-white/10" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-white">Mes fichiers</CardTitle>
                <CardDescription className="text-gray-400">
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
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-lg font-semibold text-gray-300 mb-2">Aucun fichier</p>
                <p className="text-sm text-gray-500">Commencez par télécharger votre premier fichier</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className="group flex items-center justify-between p-4 rounded-xl glass border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300 hover-lift animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-200 truncate group-hover:text-purple-400 transition-colors">
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
                        className="hover:bg-purple-500/20 hover:text-purple-400"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file)}
                        className="hover:bg-red-500/20 hover:text-red-400"
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