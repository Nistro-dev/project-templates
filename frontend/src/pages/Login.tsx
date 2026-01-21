import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks'
import { loginSchema, type LoginFormData } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react'

export const Login = () => {
  const { login, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    try {
      await login(data)
    } catch (err: unknown) {
      // Type guard pour vérifier si c'est une erreur Axios
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
        const status = axiosError.response?.status
        const message = axiosError.response?.data?.message

        if (status === 401) {
          setError('Email ou mot de passe incorrect')
        } else if (status === 403) {
          setError('Votre compte a été désactivé')
        } else if (status === 429) {
          setError('Trop de tentatives. Veuillez réessayer plus tard')
        } else if (message) {
          setError(message)
        } else {
          setError('Une erreur est survenue lors de la connexion')
        }
      } else {
        setError('Une erreur est survenue lors de la connexion')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md glass-strong backdrop-blur-2xl border-white/10 shadow-2xl animate-scale-in relative z-10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center glow mb-2">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold font-display text-gradient">
            Connexion
          </CardTitle>
          <CardDescription className="text-base text-gray-400">
            Accédez à votre espace personnel
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-4 rounded-lg border border-red-500/20 animate-fade-in">
                {error}
              </div>
            )}
            
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-300">
                  Mot de passe
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Checkbox
                id="remember"
                label="Se souvenir de moi"
                {...register('remember')}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full group bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              size="lg"
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion en cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Se connecter
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
              Pas encore de compte ?{' '}
              <Link
                to="/register"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}