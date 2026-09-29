import cors = require('cors')
import express = require('express')
import payment = require('./payment')

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

app.post('/api/SnailPay', async (request, response) => {
  const data = request.body as payment.PaymentRequest
  const result = payment.processPayment(data)

  if (result.delayMilliseconds) {
    await wait(result.delayMilliseconds)
  }

  return response.status(result.statusCode).json(result.body)
})

app.listen(port, () => {
  console.log(`Sistema de cobro ejecutándose en http://localhost:${port}`)
})
