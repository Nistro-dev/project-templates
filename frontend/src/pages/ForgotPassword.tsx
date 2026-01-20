import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Sparkles, ArrowLeft, CheckCircle } from 'lucide-react'
import { authService } from '@/services/auth'

export const ForgotPassword = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null)
    setSuccess(false)
    try {
      await authService.forgotPassword(data.email)
      setSuccess(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
        const status = axiosError.response?.status
        const message = axiosError.response?.data?.message

        if (status === 404) {
          // Pour des raisons de sécurité, on n'indique pas si l'email existe ou non
          setSuccess(true)
        } else if (status === 429) {
          setError('Trop de tentatives. Veuillez réessayer plus tard')
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
            Mot de passe oublié
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Entrez votre email pour réinitialiser votre mot de passe
          </CardDescription>
        </CardHeader>
        
        {success ? (
          <CardContent className="space-y-5">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Email envoyé !</h3>
              </div>
              <p className="text-sm text-green-800">
                Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
            </div>
            <Link to="/login" className="block">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Button>
            </Link>
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
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  disabled={isSubmitting}
                  {...register('email')}
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
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer le lien de réinitialisation'
                )}
              </Button>

              <Link to="/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la connexion
                </Button>
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
