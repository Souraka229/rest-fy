'use client'

import { useState, useEffect } from 'react'
import { Search, Star, MapPin, Clock, Sparkles, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRestaurants, getCurrentUser } from '@/lib/supabase'

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
  delivery_fee: number
  minimum_order: number
  slug: string
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const popularCategories = [
    'Tous', 'Pizza', 'Burger', 'Sushi', 'Africain', 
    'Italien', 'Chinois', 'Fast-food', 'Dessert'
  ]

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterRestaurants()
  }, [searchTerm, selectedCategory, restaurants])

  const loadData = async () => {
    try {
      setLoading(true)
      const [restaurantsData, userData] = await Promise.all([
        getRestaurants(),
        getCurrentUser()
      ])
      
      setRestaurants(restaurantsData)
      setUser(userData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRestaurants = () => {
    let filtered = restaurants

    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory && selectedCategory !== 'Tous') {
      filtered = filtered.filter(restaurant =>
        restaurant.category === selectedCategory
      )
    }

    setFilteredRestaurants(filtered)
  }

  const addToFavorites = async (restaurantId: string) => {
    if (!user) {
      // Rediriger vers la page de connexion
      window.location.href = '/login'
      return
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, restaurant_id: restaurantId }])

      if (error) throw error

      // Mettre à jour l'UI
      alert('Restaurant ajouté aux favoris!')
    } catch (error) {
      console.error('Error adding to favorites:', error)
    }
  }

  const topRatedRestaurants = restaurants
    .filter(r => r.rating >= 4.0)
    .slice(0, 4)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des restaurants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Découvrez les meilleurs restaurants près de chez vous
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Commandez vos plats préférés en quelques clics. Livraison rapide, paiement sécurisé.
            </p>
            
            {/* Barre de recherche */}
            <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
              <div className="flex">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Rechercher un restaurant, un plat..."
                    className="pl-10 border-0 text-gray-900 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button className="h-12 px-8 bg-orange-500 hover:bg-orange-600 ml-2">
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catégories populaires */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Catégories populaires</h2>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {popularCategories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap rounded-full px-6"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Top restaurants */}
      {topRatedRestaurants.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Top Restaurants</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRatedRestaurants.map(restaurant => (
              <Card key={restaurant.id} className="group cursor-pointer hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-0 relative">
                  <div 
                    className="relative overflow-hidden rounded-t-xl h-48 bg-gradient-to-br from-orange-100 to-red-100 cursor-pointer"
                    onClick={() => window.location.href = `/restaurants/${restaurant.slug}`}
                  >
                    {restaurant.image_url ? (
                      <img 
                        src={restaurant.image_url} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-orange-500 text-white border-0">
                        ⭐ {restaurant.rating}
                      </Badge>
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToFavorites(restaurant.id)
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 
                        className="font-bold text-lg text-gray-900 cursor-pointer"
                        onClick={() => window.location.href = `/restaurants/${restaurant.slug}`}
                      >
                        {restaurant.name}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {restaurant.city}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {restaurant.delivery_time}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={() => window.location.href = `/restaurants/${restaurant.slug}`}
                    >
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory ? `Restaurants ${selectedCategory}` : 'Tous les restaurants'} 
            <span className="text-gray-500 text-lg ml-2">({filteredRestaurants.length})</span>
          </h2>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun restaurant trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map(restaurant => (
              <Card 
                key={restaurant.id} 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <CardContent className="p-0">
                  <div 
                    className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl cursor-pointer"
                    onClick={() => window.location.href = `/restaurants/${restaurant.slug}`}
                  >
                    {restaurant.image_url ? (
                      <img 
                        src={restaurant.image_url} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover rounded-t-xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-t-xl">
                        <span className="text-3xl">🏪</span>
                      </div>
                    )}
                    <Badge className="absolute top-2 left-2 bg-orange-500 text-white border-0">
                      ⭐ {restaurant.rating}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <div 
                      className="flex justify-between items-start mb-2 cursor-pointer"
                      onClick={() => window.location.href = `/restaurants/${restaurant.slug}`}
                    >
                      <h3 className="font-bold text-gray-900">{restaurant.name}</h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{restaurant.category}</span>
                      <span>{restaurant.delivery_fee === 0 ? 'Livraison gratuite' : `${restaurant.delivery_fee} FCFA`}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
