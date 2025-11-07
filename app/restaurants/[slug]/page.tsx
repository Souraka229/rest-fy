'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Star, MapPin, Clock, Heart, Plus, Minus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRestaurantBySlug, getMenuItems, getCurrentUser } from '@/lib/supabase'

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
  phone: string
  delivery_fee: number
  minimum_order: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  preparation_time: number
  is_available: boolean
}

interface CartItem {
  product: Product
  quantity: number
}

export default function RestaurantPage() {
  const params = useParams()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Tous')

  useEffect(() => {
    loadRestaurantData()
  }, [params.slug])

  const loadRestaurantData = async () => {
    try {
      setLoading(true)
      const restaurantData = await getRestaurantBySlug(params.slug as string)
      if (restaurantData) {
        setRestaurant(restaurantData)
        const menuItems = await getMenuItems(restaurantData.id)
        setProducts(menuItems)
      }
    } catch (error) {
      console.error('Error loading restaurant:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      } else {
        return prevCart.filter(item => item.product.id !== productId)
      }
    })
  }

  const getCartQuantity = (productId: string) => {
    const item = cart.find(item => item.product.id === productId)
    return item ? item.quantity : 0
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const proceedToCheckout = () => {
    if (cart.length === 0) return
    
    // Sauvegarder le panier dans le localStorage
    localStorage.setItem('currentCart', JSON.stringify({
      restaurant,
      items: cart,
      total: getTotalPrice()
    }))
    
    window.location.href = '/checkout'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du restaurant...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant non trouvé</h1>
          <p className="text-gray-600">Le restaurant que vous recherchez n'existe pas.</p>
          <Button 
            className="mt-4 bg-orange-500 hover:bg-orange-600"
            onClick={() => window.location.href = '/'}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  const categories = ['Tous', ...new Set(products.map(p => p.category))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête du restaurant */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                {restaurant.image_url ? (
                  <img 
                    src={restaurant.image_url} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span className="text-3xl">🏪</span>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                  <p className="text-gray-600 mb-4">{restaurant.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{restaurant.rating} ({restaurant.total_reviews} avis)</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{restaurant.address}, {restaurant.city}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{restaurant.delivery_time}</span>
                    </div>
                  </div>
                </div>
                
                <Button className="bg-orange-500 hover:bg-orange-600 mt-4 md:mt-0">
                  <Heart className="w-4 h-4 mr-2" />
                  Favoris
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu */}
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className="whitespace-nowrap rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid gap-4">
              {products
                .filter(product => activeCategory === 'Tous' || product.category === activeCategory)
                .map(product => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{product.name}</h3>
                              <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                              <p className="text-orange-600 font-bold mt-2">
                                {product.price.toLocaleString()} FCFA
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-gray-500">
                              {product.preparation_time} min
                            </span>
                            
                            <div className="flex items-center gap-2">
                              {getCartQuantity(product.id) > 0 && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromCart(product.id)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="font-semibold">{getCartQuantity(product.id)}</span>
                                </>
                              )}
                              <Button
                                size="sm"
                                onClick={() => addToCart(product)}
                                disabled={!product.is_available}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Ajouter
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Panier */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Votre commande</h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Votre panier est vide</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} x {item.product.price.toLocaleString()} FCFA
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(item.product)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t mt-4 pt-4">
                      <div className="flex justify-between mb-2">
                        <span>Sous-total:</span>
                        <span>{getTotalPrice().toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Frais de livraison:</span>
                        <span>{restaurant.delivery_fee === 0 ? 'Gratuit' : `${restaurant.delivery_fee.toLocaleString()} FCFA`}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>{(getTotalPrice() + restaurant.delivery_fee).toLocaleString()} FCFA</span>
                      </div>

                      <Button 
                        className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
                        onClick={proceedToCheckout}
                      >
                        Commander maintenant
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
