import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks'
import { registerSchema, type RegisterFormData } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react'

const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  if (!password) return { strength: 0, label: '', color: '' }
  
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  if (strength <= 2) return { strength: 33, label: 'Faible', color: 'bg-red-500' }
  if (strength <= 4) return { strength: 66, label: 'Moyen', color: 'bg-yellow-500' }
  return { strength: 100, label: 'Fort', color: 'bg-green-500' }
}

export const Register = () => {
  const { register: registerUser, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const passwordStrength = getPasswordStrength(watch('password') || '')

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, acceptTerms, ...registerData } = data
      await registerUser(registerData)
    } catch (err: unknown) {
      // Type guard pour vérifier si c'est une erreur Axios
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
        const status = axiosError.response?.status
        const message = axiosError.response?.data?.message

        if (status === 409) {
          setError('Cet email est déjà utilisé')
        } else if (status === 400) {
          setError(message || 'Les données saisies sont invalides')
        } else if (status === 429) {
          setError('Trop de tentatives. Veuillez réessayer plus tard')
        } else if (message) {
          setError(message)
        } else {
          setError('Une erreur est survenue lors de l\'inscription')
        }
      } else {
        setError('Une erreur est survenue lors de l\'inscription')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 py-12 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <Card className="w-full max-w-2xl glass-strong backdrop-blur-2xl border-white/10 shadow-2xl animate-scale-in relative z-10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center glow-pink mb-2">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold font-display text-gradient">
            Créer un compte
          </CardTitle>
          <CardDescription className="text-base text-gray-400">
            Rejoignez-nous et commencez dès maintenant
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-4 rounded-lg border border-red-500/20 animate-fade-in">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold text-gray-300">
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  icon={<User className="w-4 h-4" />}
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold text-gray-300">
                  Nom
                </Label>
                <Input
                  id="lastName"
                  placeholder="Dupont"
                  icon={<User className="w-4 h-4" />}
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-300">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-300">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              {watch('password') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Force du mot de passe</span>
                    <span className={`font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-500`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-300">
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <div className="pt-2">
              <Checkbox
                id="acceptTerms"
                label={
                  <span className="text-sm text-gray-400">
                    J'accepte les{' '}
                    <Link to="/terms" className="text-purple-400 hover:text-purple-300 font-medium">
                      conditions d'utilisation
                    </Link>
                    {' '}et la{' '}
                    <Link to="/privacy" className="text-purple-400 hover:text-purple-300 font-medium">
                      politique de confidentialité
                    </Link>
                  </span>
                }
                {...register('acceptTerms')}
              />
              {errors.acceptTerms && (
                <p className="text-xs text-red-400 font-medium mt-1 ml-7">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              size="lg"
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Créer mon compte
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0f0f0f] px-2 text-gray-500">ou</span>
              </div>
            </div>

            <p className="text-sm text-center text-gray-400">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}