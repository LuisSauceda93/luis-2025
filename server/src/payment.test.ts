import assert = require('node:assert/strict')
import test = require('node:test')
import payment = require('./payment')

const validPayment: payment.PaymentRequest = {
  card_number: '1234123412341234',
  expiration_date: '12/26',
  cvv: '543',
  full_name: 'Luis Sauceda',
  amount: 100,
  payer_id: 'user-1',
  payer_email: 'luis@example.com',
  simulation_mode: 'normal',
}

function createPayment(
  changes: Partial<payment.PaymentRequest> = {},
): payment.PaymentRequest {
  return { ...validPayment, ...changes }
}

test('aprueba un cobro con datos válidos', () => {
  const result = payment.processPayment(createPayment())

  assert.equal(result.statusCode, 200)
  assert.equal(result.body.status, 'approved')
  assert.equal(result.body.transaction_amount, 100)
  assert.ok(result.body.authorization_code)
})

test('rechaza una tarjeta diferente a la aprobada', () => {
  const result = payment.processPayment(
    createPayment({ card_number: '0000000000000000' }),
  )

  assert.equal(result.statusCode, 402)
  assert.equal(result.body.status, 'rejected')
  assert.equal(result.body.authorization_code, null)
})

test('rechaza un monto inválido', () => {
  const result = payment.processPayment(createPayment({ amount: 0 }))

  assert.equal(result.statusCode, 400)
  assert.equal(result.body.status, 'rejected')
  assert.equal(result.body.status_detail, 'El monto y el nombre son obligatorios')
})

test('simula un error del sistema', () => {
  const result = payment.processPayment(
    createPayment({ simulation_mode: 'system_error' }),
  )

  assert.equal(result.statusCode, 503)
  assert.equal(result.body.status, 'system_error')
  assert.equal(result.body.card_number, validPayment.card_number)
  assert.equal(result.body.cvv, validPayment.cvv)
})

test('simula un timeout y conserva todos los campos de respuesta', () => {
  const result = payment.processPayment(createPayment({ simulation_mode: 'timeout' }))
  const requiredFields = [
    'id',
    'status',
    'status_detail',
    'transaction_amount',
    'date_created',
    'authorization_code',
    'reference',
    'payer_id',
    'payer_email',
    'card_number',
    'cvv',
  ]

  assert.equal(result.statusCode, 503)
  assert.equal(result.body.status, 'system_error')
  assert.equal(result.delayMilliseconds, 5000)

  for (const field of requiredFields) {
    assert.ok(field in result.body)
  }
})
