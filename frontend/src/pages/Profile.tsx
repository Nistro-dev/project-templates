import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema, changePasswordSchema, type UpdateProfileFormData, type ChangePasswordFormData } from '@/schemas'
import { useAuthStore } from '@/store/auth'
import { useToast } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Lock, Save, ArrowLeft } from 'lucide-react'
import { authService } from '@/services/auth'
import { Link } from 'react-router-dom'

export const Profile = () => {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.setUser)
  const { toast } = useToast()
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  })

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPassword,
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
  })

  const newPassword = watch('newPassword')

  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    if (!pwd) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    if (strength <= 2) return { strength: 33, label: 'Faible', color: 'bg-red-500' }
    if (strength <= 4) return { strength: 66, label: 'Moyen', color: 'bg-yellow-500' }
    return { strength: 100, label: 'Fort', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(newPassword || '')

  const onSubmitProfile = async (data: UpdateProfileFormData) => {
    setProfileError(null)
    try {
      const updatedUser = await authService.updateProfile(data)
      updateUser(updatedUser)
      toast({
        title: 'Succès',
        description: 'Profil mis à jour avec succès',
      })
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
        const status = axiosError.response?.status
        const message = axiosError.response?.data?.message

        if (status === 400) {
          setProfileError(message || 'Les données saisies sont invalides')
        } else if (status === 409) {
          setProfileError('Cet email est déjà utilisé')
        } else if (message) {
          setProfileError(message)
        } else {
          setProfileError('Une erreur est survenue lors de la mise à jour')
        }
      } else {
        setProfileError('Une erreur est survenue lors de la mise à jour')
      }
    }
  }

  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    setPasswordError(null)
    try {
      await authService.changePassword(data.currentPassword, data.newPassword)
      resetPassword()
      toast({
        title: 'Succès',
        description: 'Mot de passe changé avec succès',
      })
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
        const status = axiosError.response?.status
        const message = axiosError.response?.data?.message

        if (status === 401) {
          setPasswordError('Le mot de passe actuel est incorrect')
        } else if (status === 400) {
          setPasswordError(message || 'Les données saisies sont invalides')
        } else if (message) {
          setPasswordError(message)
        } else {
          setPasswordError('Une erreur est survenue lors du changement de mot de passe')
        }
      } else {
        setPasswordError('Une erreur est survenue lors du changement de mot de passe')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Informations du profil</CardTitle>
                  <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
              <CardContent className="space-y-5">
                {profileError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20 animate-fade-in">
                    {profileError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                      Prénom
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Jean"
                      icon={<User className="w-4 h-4" />}
                      error={profileErrors.firstName?.message}
                      disabled={isSubmittingProfile}
                      {...registerProfile('firstName')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                      Nom
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      icon={<User className="w-4 h-4" />}
                      error={profileErrors.lastName?.message}
                      disabled={isSubmittingProfile}
                      {...registerProfile('lastName')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    icon={<User className="w-4 h-4" />}
                    error={profileErrors.email?.message}
                    disabled={isSubmittingProfile}
                    {...registerProfile('email')}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingProfile}
                    className="gap-2"
                  >
                    {isSubmittingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center shadow-glow-pink">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Changer le mot de passe</CardTitle>
                  <CardDescription>Assurez-vous de choisir un mot de passe sécurisé</CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
              <CardContent className="space-y-5">
                {passwordError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20 animate-fade-in">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">
                    Mot de passe actuel
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    error={passwordErrors.currentPassword?.message}
                    disabled={isSubmittingPassword}
                    {...registerPassword('currentPassword')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    error={passwordErrors.newPassword?.message}
                    disabled={isSubmittingPassword}
                    {...registerPassword('newPassword')}
                  />
                  {newPassword && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Force du mot de passe</span>
                        <span className={`font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-500`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-sm font-semibold text-gray-700">
                    Confirmer le nouveau mot de passe
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    error={passwordErrors.confirmNewPassword?.message}
                    disabled={isSubmittingPassword}
                    {...registerPassword('confirmNewPassword')}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isSubmittingPassword}
                    className="gap-2"
                  >
                    {isSubmittingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Changement...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Changer le mot de passe
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
