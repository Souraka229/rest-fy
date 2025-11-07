// Système de paiement simulé pour le MVP
export interface PaymentResult {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  error?: string
}

export async function initiatePayment(order: any): Promise<PaymentResult> {
  try {
    // Simulation de création de transaction
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Pour le MVP, on simule un paiement réussi
    return {
      success: true,
      transactionId,
      paymentUrl: `/payment/success?transactionId=${transactionId}`
    }
  } catch (error) {
    console.error('Payment initiation error:', error)
    return {
      success: false,
      error: 'Erreur lors de l\'initialisation du paiement'
    }
  }
}

export async function verifyPayment(transactionId: string): Promise<PaymentResult> {
  // Simulation de vérification de paiement
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    success: true,
    transactionId
  }
}
