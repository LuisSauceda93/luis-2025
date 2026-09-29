import cors = require('cors')
import express = require('express')

type PaymentStatus = 'approved' | 'rejected' | 'system_error'

type PaymentRequest = {
  card_number?: string
  expiration_date?: string
  cvv?: string
  full_name?: string
  amount?: number
  payer_id?: string
  payer_email?: string
  simulation_mode?: 'normal' | 'system_error' | 'timeout'
}

const app = express()
const port = 3000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/', (_request, response) => {
  response.json({ mensaje: 'Servidor funcionando' })
})

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function createPaymentResponse(
  data: PaymentRequest,
  status: PaymentStatus,
  statusDetail: string,
) {
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

app.post('/api/SnailPay', async (request, response) => {
  const data = request.body as PaymentRequest
  const simulationMode = data.simulation_mode ?? 'normal'

  if (simulationMode === 'system_error') {
    return response
      .status(503)
      .json(createPaymentResponse(data, 'system_error', 'El sistema de cobro no está disponible temporalmente'))
  }

  if (simulationMode === 'timeout') {
    await wait(5000)
    return response
      .status(503)
      .json(createPaymentResponse(data, 'system_error', 'La solicitud tardó demasiado'))
  }

  const amount = Number(data.amount)
  const hasValidAmount = Number.isFinite(amount) && amount > 0
  const hasValidName = Boolean(data.full_name?.trim())
  const isApprovedCard =
    data.card_number === '1234123412341234' &&
    data.expiration_date === '12/26' &&
    data.cvv === '543'

  if (!hasValidAmount || !hasValidName) {
    return response
      .status(400)
      .json(createPaymentResponse(data, 'rejected', 'El monto y el nombre son obligatorios'))
  }

  if (!isApprovedCard) {
    return response
      .status(402)
      .json(createPaymentResponse(data, 'rejected', 'Los datos de pago fueron rechazados'))
  }

  return response
    .status(200)
    .json(createPaymentResponse(data, 'approved', 'Cobro aprobado'))
})

app.listen(port, () => {
  console.log(`Sistema de cobro ejecutándose en http://localhost:${port}`)
})
