'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, Mail, Lock, User, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState('client')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    restaurantName: '',
    restaurantCategory: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: activeTab,
            phone: formData.phone
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: activeTab,
            phone: formData.phone
          })

        if (profileError) throw profileError

        // Si c'est un restaurant, créer l'entrée restaurant
        if (activeTab === 'restaurant' && formData.restaurantName) {
          const { error: restaurantError } = await supabase
            .from('restaurants')
            .insert({
              user_id: authData.user.id,
              name: formData.restaurantName,
              category: formData.restaurantCategory,
              email: formData.email,
              phone: formData.phone,
              is_active: true
            })

          if (restaurantError) throw restaurantError
        }

        // Rediriger vers la page appropriée
        if (activeTab === 'restaurant') {
          router.push('/restaurant-setup')
        } else {
          router.push('/')
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <CardTitle className="text-2xl font-bold text-orange-600">Restafy</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Rejoignez notre communauté
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="client">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Nom complet"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="pl-10 pr-10 h-11"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <Input
                    type="tel"
                    placeholder="Téléphone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="h-11"
                  />
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Minimum 6 caractères
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Création du compte...' : 'Créer un compte'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="restaurant">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Votre nom complet"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Nom du restaurant"
                      value={formData.restaurantName}
                      onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  
                  <Input
                    placeholder="Catégorie du restaurant"
                    value={formData.restaurantCategory}
                    onChange={(e) => setFormData({...formData, restaurantCategory: e.target.value})}
                    className="h-11"
                    required
                  />
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email professionnel"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="pl-10 pr-10 h-11"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <Input
                    type="tel"
                    placeholder="Téléphone du restaurant"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="h-11"
                    required
                  />
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Minimum 6 caractères
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Création du restaurant...' : 'Créer mon restaurant'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              En vous inscrivant, vous acceptez nos{' '}
              <a href="#" className="text-orange-500 hover:underline">conditions d'utilisation</a>{' '}
              et notre{' '}
              <a href="#" className="text-orange-500 hover:underline">politique de confidentialité</a>
            </p>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="link" 
                onClick={() => router.push('/login')}
                className="text-orange-500"
              >
                Déjà un compte ? Se connecter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
