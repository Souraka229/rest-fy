'use client'

import { useState, useEffect } from 'react'
import { Search, Star, MapPin, Clock, ChevronRight, Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

interface Restaurant {
  id: string
  name: string
  description: string
  category: string
  rating: number
  total_reviews: number
  delivery_time: string
  image_url?: string
  address: string
  city: string
  is_top_rated: boolean
  distance?: number
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null)

  const popularCategories = [
    'Pizza', 'Burger', 'Sushi', 'Attiéké', 'Poulet braisé', 
    'Italien', 'Chinois', 'Africain', 'Fast-food', 'Dessert'
  ]

  useEffect(() => {
    fetchRestaurants()
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }

  const fetchRestaurants = async () => {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
    
    // Simuler les données de distance et top rated
    const restaurantsWithData = (data || []).map(restaurant => ({
      ...restaurant,
      is_top_rated: restaurant.rating >= 4.5,
      distance: Math.random() * 15 + 0.5 // Distance simulée entre 0.5km et 15km
    }))
    
    setRestaurants(restaurantsWithData)
  }

  const topRestaurants = restaurants.filter(r => r.is_top_rated).slice(0, 4)
  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory ? restaurant.category === selectedCategory : true)
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Découvrez les meilleurs restaurants près de chez vous
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Commandez vos plats préférés en quelques clics. Livraison rapide, paiement sécurisé.
            </p>
            
            {/* Barre de recherche avancée */}
            <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Votre adresse ou ville..."
                    className="pl-10 border-0 text-gray-900 h-12"
                  />
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Restaurant ou plat..."
                    className="pl-10 border-0 text-gray-900 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button className="h-12 px-8 bg-orange-500 hover:bg-orange-600">
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catégories populaires */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Populaires</h2>
          <Button variant="ghost" className="text-orange-500">
            Voir tout <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {popularCategories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(
                selectedCategory === category ? '' : category
              )}
              className="whitespace-nowrap rounded-full px-6"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Top de la semaine */}
      {topRestaurants.length > 0 && (
        <div className="container mx-auto px-4 py-8 bg-white">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Top de la semaine</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRestaurants.map(restaurant => (
              <Card key={restaurant.id} className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0">
                <CardContent className="p-0 relative">
                  <div className="relative overflow-hidden rounded-2xl">
                    {restaurant.image_url ? (
                      <img 
                        src={restaurant.image_url} 
                        alt={restaurant.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-orange-500 text-white border-0">
                        🏆 Top
                      </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{restaurant.name}</h3>
                      <div className="flex items-center bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-sm">
                        <Star className="w-3 h-3 fill-current mr-1" />
                        {restaurant.rating}
                        <span className="text-gray-500 ml-1">({restaurant.total_reviews})</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {restaurant.distance?.toFixed(1)} km
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {restaurant.delivery_time}
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                      Voir le menu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tous les restaurants */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tous les restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRestaurants.map(restaurant => (
            <Card 
              key={restaurant.id} 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200"
              onClick={() => window.location.href = `/restaurants/${restaurant.id}`}
            >
              <CardContent className="p-0">
                <div className="relative">
                  {restaurant.image_url ? (
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name}
                      className="w-full h-40 object-cover rounded-t-xl"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
                      <span className="text-2xl">🏪</span>
                    </div>
                  )}
                  {restaurant.is_top_rated && (
                    <Badge className="absolute top-2 left-2 bg-orange-500 text-white border-0 text-xs">
                      Top
                    </Badge>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{restaurant.name}</h3>
                    <div className="flex items-center text-sm">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {restaurant.rating}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {restaurant.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {restaurant.distance?.toFixed(1)} km
                    </span>
                    <span>{restaurant.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Section Comment ça marche */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Commandez en 4 étapes simples et rapides
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Découvrez",
                description: "Parcourez les meilleurs restaurants de votre ville",
                icon: "🔍"
              },
              {
                step: "2",
                title: "Commandez",
                description: "Ajoutez vos plats préférés au panier en quelques clics",
                icon: "🛒"
              },
              {
                step: "3",
                title: "Payez",
                description: "Réglez de manière sécurisée par carte ou Mobile Money",
                icon: "💳"
              },
              {
                step: "4",
                title: "Dégustez",
                description: "Recevez votre commande chaude et savoureuse à domicile",
                icon: "🍽️"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
