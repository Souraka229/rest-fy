'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createOrder, getCurrentUser } from '@/lib/supabase'

interface CheckoutData {
  restaurant: any
  items: Array<{
    product: any
    quantity: number
  }>
  total: number
}

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    instructions: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedCart = localStorage.getItem('currentCart')
    if (!savedCart) {
      router.push('/')
      return
    }
    setCheckoutData(JSON.parse(savedCart))
  }, [router])

  const handleSubmitOrder = async () => {
    if (!checkoutData || !customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const user = await getCurrentUser()
      
      const orderData = {
        user_id: user?.id || null,
        restaurant_id: checkoutData.restaurant.id,
        status: 'pending',
        service_type: 'delivery',
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: user?.email,
        delivery_address: customerInfo.address,
        special_instructions: customerInfo.instructions,
        items_total: checkoutData.total,
        delivery_fee: checkoutData.restaurant.delivery_fee,
        total_amount: checkoutData.total + checkoutData.restaurant.delivery_fee,
        payment_method: 'cash',
        payment_status: 'pending'
      }

      const order = await createOrder(orderData)
      
      // Vider le panier
      localStorage.removeItem('currentCart')
      
      // Rediriger vers la page de confirmation
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Erreur lors de la création de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser votre commande</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations client */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Nom complet *"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                />
                <Input
                  placeholder="Téléphone *"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                />
                <Input
                  placeholder="Adresse de livraison *"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                />
                <Input
                  placeholder="Instructions spéciales (optionnel)"
                  value={customerInfo.instructions}
                  onChange={(e) => setCustomerInfo({...customerInfo, instructions: e.target.value})}
                />
              </CardContent>
            </Card>
          </div>

          {/* Récapitulatif */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkoutData.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>{(item.product.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{checkoutData.total.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de livraison:</span>
                      <span>{checkoutData.restaurant.delivery_fee === 0 ? 'Gratuit' : `${checkoutData.restaurant.delivery_fee.toLocaleString()} FCFA`}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{(checkoutData.total + checkoutData.restaurant.delivery_fee).toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg"
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? 'Traitement...' : 'Confirmer la commande'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
