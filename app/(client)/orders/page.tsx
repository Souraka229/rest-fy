'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package, 
  Truck, 
  Home,
  Star,
  MapPin
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  estimated_time: string
  restaurant: {
    name: string
    address: string
    image_url?: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(name, address, image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      // Simuler les données d'items
      const ordersWithItems = (data || []).map(order => ({
        ...order,
        items: [
          { name: 'Poulet Braisé', quantity: 2, price: 4500 },
          { name: 'Attiéké', quantity: 1, price: 1500 }
        ]
      }))
      
      setOrders(ordersWithItems)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        label: 'En attente', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        step: 1
      },
      confirmed: { 
        label: 'Confirmée', 
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        step: 2
      },
      preparing: { 
        label: 'En préparation', 
        color: 'bg-orange-100 text-orange-800',
        icon: ChefHat,
        step: 3
      },
      ready: { 
        label: 'Prête', 
        color: 'bg-purple-100 text-purple-800',
        icon: Package,
        step: 4
      },
      delivering: { 
        label: 'En livraison', 
        color: 'bg-indigo-100 text-indigo-800',
        icon: Truck,
        step: 5
      },
      completed: { 
        label: 'Livrée', 
        color: 'bg-green-100 text-green-800',
        icon: Home,
        step: 6
      }
    }
    
    return configs[status as keyof typeof configs] || configs.pending
  }

  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status)
  )
  
  const historyOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  )

  const OrderCard = ({ order }: { order: Order }) => {
    const statusConfig = getStatusConfig(order.status)
    const StatusIcon = statusConfig.icon
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Commande #{order.order_number}</CardTitle>
              <CardDescription>
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </CardDescription>
            </div>
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Restaurant info */}
          <div className="flex items-center gap-3">
            {order.restaurant.image_url ? (
              <img 
                src={order.restaurant.image_url} 
                alt={order.restaurant.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🏪</span>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900">{order.restaurant.name}</h4>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {order.restaurant.address}
              </div>
            </div>
          </div>
          
          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium">
                  {(item.quantity * item.price).toLocaleString()} FCFA
                </span>
              </div>
            ))}
          </div>
          
          {/* Progress bar */}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Confirmée</span>
                <span>En préparation</span>
                <span>Prête</span>
                <span>Livraison</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(statusConfig.step / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Total and actions */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="font-bold text-lg">
              {order.total_amount.toLocaleString()} FCFA
            </div>
            <div className="flex gap-2">
              {order.status === 'completed' && (
                <Button size="sm" variant="outline">
                  <Star className="w-4 h-4 mr-1" />
                  Noter
                </Button>
              )}
              <Button size="sm" variant="outline">
                Détails
              </Button>
              {['pending', 'confirmed'].includes(order.status) && (
                <Button size="sm" variant="destructive">
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Commandes</h1>
          <p className="text-gray-600">Suivez l'état de vos commandes en temps réel</p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'active' ? 'default' : 'outline'}
            onClick={() => setActiveTab('active')}
            className="rounded-full"
          >
            Commandes actives ({activeOrders.length})
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
            className="rounded-full"
          >
            Historique ({historyOrders.length})
          </Button>
        </div>
        
        {/* Orders list */}
        <div className="space-y-4">
          {(activeTab === 'active' ? activeOrders : historyOrders).map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
          
          {(activeTab === 'active' ? activeOrders : historyOrders).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'active' ? 'Aucune commande active' : 'Aucune commande dans l\'historique'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'active' 
                    ? 'Vos commandes en cours apparaîtront ici' 
                    : 'Vos commandes passées apparaîtront ici'
                  }
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Découvrir les restaurants
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
