'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('transactionId')
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    // Récupérer les détails de la commande
    const savedOrder = localStorage.getItem('lastOrder')
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder))
      localStorage.removeItem('lastOrder')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement Réussi !
          </h1>
          
          <p className="text-gray-600 mb-4">
            Votre commande a été confirmée et sera préparée rapidement.
          </p>

          {transactionId && (
            <p className="text-sm text-gray-500 mb-4">
              Transaction: {transactionId}
            </p>
          )}

          {order && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Récapitulatif</h3>
              <p className="text-sm text-gray-600">
                Restaurant: {order.restaurant?.name}
              </p>
              <p className="text-sm text-gray-600">
                Total: {order.total?.toLocaleString()} FCFA
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => window.location.href = '/orders'}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Voir mes commandes
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
