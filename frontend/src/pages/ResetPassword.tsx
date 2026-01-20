import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Sparkles, CheckCircle } from 'lucide-react'
import { authService } from '@/services/auth'

export const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      token,
    },
  })

  const password = watch('password')

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

  const passwordStrength = getPasswordStrength(password || '')

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null)
    try {
      await authService.resetPassword(data.token, data.password)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
        const status = axiosError.response?.status
        const message = axiosError.response?.data?.message

        if (status === 400) {
          setError('Le lien de réinitialisation est invalide ou a expiré')
        } else if (status === 404) {
          setError('Le lien de réinitialisation est invalide')
        } else if (message) {
          setError(message)
        } else {
          setError('Une erreur est survenue. Veuillez réessayer')
        }
      } else {
        setError('Une erreur est survenue. Veuillez réessayer')
      }
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-premium px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Lien invalide</CardTitle>
            <CardDescription>Le lien de réinitialisation est manquant ou invalide</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/forgot-password" className="w-full">
              <Button className="w-full">Demander un nouveau lien</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-premium px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md glass backdrop-blur-xl border-white/30 shadow-2xl animate-scale-in relative z-10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow mb-2">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold font-display bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Nouveau mot de passe
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Choisissez un nouveau mot de passe sécurisé
          </CardDescription>
        </CardHeader>
        
        {success ? (
          <CardContent className="space-y-5">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Mot de passe réinitialisé !</h3>
              </div>
              <p className="text-sm text-green-800">
                Votre mot de passe a été réinitialisé avec succès. Redirection vers la page de connexion...
              </p>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20 animate-fade-in">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Nouveau mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  disabled={isSubmitting}
                  {...register('password')}
                />
                {password && (
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
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword?.message}
                  disabled={isSubmitting}
                  {...register('confirmPassword')}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Réinitialisation...
                  </span>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>

              <p className="text-sm text-center text-gray-600">
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-600 font-semibold transition-colors"
                >
                  Retour à la connexion
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
