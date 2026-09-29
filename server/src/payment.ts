export type PaymentStatus = 'approved' | 'rejected' | 'system_error'

export type PaymentRequest = {
  card_number?: string
  expiration_date?: string
  cvv?: string
  full_name?: string
  amount?: number
  payer_id?: string
  payer_email?: string
  simulation_mode?: 'normal' | 'system_error' | 'timeout'
}

export type PaymentResponse = {
  id: string
  status: PaymentStatus
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

export type PaymentResult = {
  statusCode: number
  body: PaymentResponse
  delayMilliseconds?: number
}

function createPaymentResponse(
  data: PaymentRequest,
  status: PaymentStatus,
  statusDetail: string,
): PaymentResponse {
  return {
    id: `payment-${Date.now()}`,
    status,
    status_detail: statusDetail,
    transaction_amount: Number(data.amount ?? 0),
    date_created: new Date().toISOString(),
    authorization_code: status === 'approved' ? `AUTH-${Date.now()}` : null,
    reference: `REF-${Date.now()}`,
    payer_id: data.payer_id ?? '',
    payer_email: data.payer_email ?? '',
    card_number: data.card_number ?? '',
    cvv: data.cvv ?? '',
  }
}

export function processPayment(data: PaymentRequest): PaymentResult {
  const simulationMode = data.simulation_mode ?? 'normal'

  if (simulationMode === 'system_error') {
    return {
      statusCode: 503,
      body: createPaymentResponse(
        data,
        'system_error',
        'El sistema de cobro no está disponible temporalmente',
      ),
    }
  }

  if (simulationMode === 'timeout') {
    return {
      statusCode: 503,
      delayMilliseconds: 5000,
      body: createPaymentResponse(data, 'system_error', 'La solicitud tardó demasiado'),
    }
  }

  const amount = Number(data.amount)
  const hasValidAmount = Number.isFinite(amount) && amount > 0
  const hasValidName = Boolean(data.full_name?.trim())
  const isApprovedCard =
    data.card_number === '1234123412341234' &&
    data.expiration_date === '12/26' &&
    data.cvv === '543'

  if (!hasValidAmount || !hasValidName) {
    return {
      statusCode: 400,
      body: createPaymentResponse(data, 'rejected', 'El monto y el nombre son obligatorios'),
    }
  }

  if (!isApprovedCard) {
    return {
      statusCode: 402,
      body: createPaymentResponse(data, 'rejected', 'Los datos de pago fueron rechazados'),
    }
  }

  return {
    statusCode: 200,
    body: createPaymentResponse(data, 'approved', 'Cobro aprobado'),
  }
}
