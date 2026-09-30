export type SimulationMode = 'normal' | 'system_error' | 'timeout'

export type PaymentRequest = {
  card_number: string
  expiration_date: string
  cvv: string
  full_name: string
  amount: number
  payer_id: string
  payer_email: string
  simulation_mode: SimulationMode
}

export type PaymentResponse = {
  id: string
  status: 'approved' | 'rejected' | 'system_error'
  status_detail: string
  transaction_amount: number
  date_created: string
  authorization_code: string | null
  reference: string
  payer_id: string
  payer_email: string
  card_number: string
  cvv: string
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function chargePayment(
  payment: PaymentRequest,
): Promise<PaymentResponse> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 3000)

  try {
    const response = await fetch(`${apiUrl}/api/SnailPay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payment),
      signal: controller.signal,
    })

    return (await response.json()) as PaymentResponse
  } finally {
    window.clearTimeout(timeout)
  }
}
