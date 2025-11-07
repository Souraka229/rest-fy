'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Package,
  Clock,
  Star,
  ChefHat
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  activeProducts: number
  averageRating: number
  totalReviews: number
}

export default function RestaurantDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    averageRating: 0,
    totalReviews: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const restaurant = await getCurrentRestaurant()
    
    if (restaurant) {
      // Récupérer les statistiques
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_available', true)

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurant.id)

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0
      const averageRating = reviews?.reduce((sum, review) => sum + review.rating, 0) / (reviews?.length || 1) || 0

      setStats({
        totalOrders: orders?.length || 0,
        pendingOrders,
        totalRevenue,
        activeProducts: products?.length || 0,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews?.length || 0
      })

      // Commandes récentes
      const { data: recent } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentOrders(recent || [])

      // Produits populaires (simulés)
      setTopProducts([
        { name: 'Poulet Braisé', orders: 45, revenue: 202500 },
        { name: 'Attiéké', orders: 38, revenue: 57000 },
        { name: 'Poisson Braisé', orders: 32, revenue: 160000 }
      ])
    }
  }

  const getCurrentRestaurant = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      return restaurant
    }
    return null
  }

  const StatCard = ({ title, value, icon, description, trend }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="p-2 bg-orange-100 rounded-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="flex items-center gap-1">
          <p className="text-xs text-gray-500">{description}</p>
          {trend && (
            <Badge variant={trest > 0 ? "default" : "destructive"} className="text-xs">
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
            <p className="text-gray-600">Aperçu de votre activité restaurant</p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Package className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Revenue Total"
            value={`${stats.totalRevenue.toLocaleString()} FCFA`}
            icon={<DollarSign className="h-4 w-4 text-orange-600" />}
            description="Ce mois"
            trend={12}
          />
          <StatCard
            title="Commandes"
            value={stats.totalOrders}
            icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
            description="+24 cette semaine"
            trend={8}
          />
          <StatCard
            title="En Attente"
            value={stats.pendingOrders}
            icon={<Clock className="h-4 w-4 text-yellow-600" />}
            description="À traiter"
          />
          <StatCard
            title="Note Moyenne"
            value={stats.averageRating}
            icon={<Star className="h-4 w-4 text-green-600" />}
            description={`${stats.totalReviews} avis`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Commandes Récentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Commandes Récentes</CardTitle>
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">#{order.order_number}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {order.total_amount?.toLocaleString()} FCFA
                      </p>
                      <Badge className={`
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'}
                      `}>
                        {order.status === 'pending' ? 'En attente' : 
                         order.status === 'confirmed' ? 'Confirmée' :
                         order.status === 'preparing' ? 'En préparation' : 'Terminée'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {recentOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune commande récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Produits Populaires */}
          <Card>
            <CardHeader>
              <CardTitle>Produits Populaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.orders} commandes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {product.revenue.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Package className="w-5 h-5" />
                <span>Menu</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Commandes</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Users className="w-5 h-5" />
                <span>Avis</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Statistiques</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
