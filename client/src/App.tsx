import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { chargePayment, type SimulationMode } from './api/payments'
import { hashPassword, verifyPassword } from './utils/password'
import './App.css'

type User = {
  id: string
  fullName: string
  email: string
  passwordHash: string
}

type Session = {
  userId: string
}

type FormMode = 'login' | 'register'

type FeedbackMessageProps = {
  message: string
  isError: boolean
}

function FeedbackMessage({ message, isError }: FeedbackMessageProps) {
  const [isVisible, setIsVisible] = useState(Boolean(message))

  useEffect(() => {
    if (!message) {
      setIsVisible(false)
      return
    }

    setIsVisible(true)
    const duration = isError ? 5000 : 4000
    const timer = window.setTimeout(() => setIsVisible(false), duration)

    return () => window.clearTimeout(timer)
  }, [message, isError])

  if (!message || !isVisible) return null

  return (
    <div className={`feedback-message ${isError ? 'error-feedback' : 'success-feedback'}`} role="alert">
      <span className="feedback-icon" aria-hidden="true">
        {isError ? '!' : '✓'}
      </span>
      <span>{message}</span>
    </div>
  )
}

const STORAGE_KEYS = {
  user: 'app_user',
  session: 'app_session',
  balance: 'app_balance',
  lastPayment: 'app_last_payment',
} as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const bettingStats = {
  won: 7,
  lost: 3,
}

const raceWins = [
  { name: 'Theo', wins: 3 },
  { name: 'Chicote', wins: 2 },
  { name: 'Suave', wins: 0 },
  { name: 'Braza', wins: 1 },
  { name: 'Sombra', wins: 0 },
  { name: 'Derrape', wins: 0 },
]

function onlyDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

function formatExpiration(value: string): string {
  const digits = onlyDigits(value, 4)

  if (digits.length <= 2) {
    return digits
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function formatCardNumber(value: string): string {
  const digits = onlyDigits(value, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function readStoredUser(): User | null {
  const userData = localStorage.getItem(STORAGE_KEYS.user)

  if (!userData) {
    return null
  }

  try {
    return JSON.parse(userData) as User
  } catch {
    return null
  }
}

function readActiveUser(): User | null {
  const user = readStoredUser()
  const sessionData = localStorage.getItem(STORAGE_KEYS.session)

  if (!user || !sessionData) {
    return null
  }

  try {
    const session = JSON.parse(sessionData) as Session
    return session.userId === user.id ? user : null
  } catch {
    return null
  }
}

function App() {
  const [activeUser, setActiveUser] = useState<User | null>(readActiveUser)
  const [mode, setMode] = useState<FormMode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [balance, setBalance] = useState<number>(() =>
    Number(localStorage.getItem(STORAGE_KEYS.balance) ?? '0'),
  )
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentCard, setPaymentCard] = useState('')
  const [paymentExpiration, setPaymentExpiration] = useState('')
  const [paymentCvv, setPaymentCvv] = useState('')
  const [paymentFullName, setPaymentFullName] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('normal')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [paymentError, setPaymentError] = useState(false)
  const [isCharging, setIsCharging] = useState(false)

  function clearForm() {
    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  function clearPaymentForm() {
    setPaymentCard('')
    setPaymentExpiration('')
    setPaymentCvv('')
    setPaymentFullName('')
    setPaymentAmount('')
    setSimulationMode('normal')
  }

  function showMessage(text: string, error = false) {
    setMessage(text)
    setIsError(error)
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
    updateValue: (value: string) => void,
  ) {
    updateValue(event.target.value)
    setMessage('')
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanName = fullName.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      showMessage('Completa todos los campos.', true)
      return
    }

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      showMessage('Escribe un correo electrónico válido.', true)
      return
    }

    if (password.length < 6) {
      showMessage('La contraseña debe tener al menos 6 caracteres.', true)
      return
    }

    if (password !== confirmPassword) {
      showMessage('Las contraseñas no coinciden.', true)
      return
    }

    if (readStoredUser()) {
      showMessage('Ya existe un usuario registrado en este navegador.', true)
      return
    }

    setIsSubmitting(true)

    const newUser: User = {
      id: crypto.randomUUID(),
      fullName: cleanName,
      email: cleanEmail,
      passwordHash: await hashPassword(password),
    }

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(newUser))
    localStorage.setItem(STORAGE_KEYS.balance, '0')
    localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ userId: newUser.id } satisfies Session),
    )

    setActiveUser(newUser)
    clearForm()
    setIsSubmitting(false)
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const storedUser = readStoredUser()
    const cleanEmail = email.trim().toLowerCase()

    if (!storedUser) {
      showMessage('Primero debes registrar un usuario.', true)
      return
    }

    setIsSubmitting(true)
    const validPassword = await verifyPassword(password, storedUser.passwordHash)
    setIsSubmitting(false)

    if (storedUser.email !== cleanEmail || !validPassword) {
      showMessage('El correo o la contraseña son incorrectos.', true)
      return
    }

    localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ userId: storedUser.id } satisfies Session),
    )
    setActiveUser(storedUser)
    clearForm()
  }

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!activeUser) {
      return
    }

    const amount = Number(paymentAmount)
    const cleanCardNumber = paymentCard.replace(/\s/g, '')

    if (!cleanCardNumber || !paymentExpiration || !paymentCvv || !paymentFullName || amount <= 0) {
      setPaymentMessage('Completa los datos de la recarga y usa un monto mayor que cero.')
      setPaymentError(true)
      return
    }

    setIsCharging(true)
    setPaymentMessage('')
    setPaymentError(false)

    try {
      const payment = await chargePayment({
        card_number: cleanCardNumber,
        expiration_date: paymentExpiration,
        cvv: paymentCvv,
        full_name: paymentFullName,
        amount,
        payer_id: activeUser.id,
        payer_email: activeUser.email,
        simulation_mode: simulationMode,
      })

      localStorage.setItem(STORAGE_KEYS.lastPayment, JSON.stringify(payment))

      if (payment.status !== 'approved') {
        setPaymentMessage(payment.status_detail)
        setPaymentError(true)
        return
      }

      const newBalance = balance + payment.transaction_amount
      localStorage.setItem(STORAGE_KEYS.balance, String(newBalance))
      setBalance(newBalance)
      setPaymentMessage('Recarga aprobada correctamente.')
      clearPaymentForm()
      setShowPaymentForm(false)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setPaymentMessage('La solicitud tardó demasiado. Intenta nuevamente.')
      } else {
        setPaymentMessage('No fue posible conectar con el servicio de pagos.')
      }
      setPaymentError(true)
    } finally {
      setIsCharging(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEYS.session)
    setActiveUser(null)
    setMode('login')
    clearForm()
    clearPaymentForm()
    setShowPaymentForm(false)
    showMessage('Sesión cerrada.')
  }

  function changeMode(nextMode: FormMode) {
    setMode(nextMode)
    clearForm()
    setMessage('')
  }

  if (activeUser) {
    const totalBets = bettingStats.won + bettingStats.lost
    const wonPercentage = (bettingStats.won / totalBets) * 100
    const highestWins = Math.max(...raceWins.map((race) => race.wins))

    return (
      <main className="app-shell">
        <section className="card dashboard-card dashboard-card-wide">
          <p className="eyebrow">Dashboard</p>
          <h1>Hola, {activeUser.fullName}</h1>
          <p className="muted">Tu sesión está activa.</p>

          <div className="balance-box">
            <span>Saldo actual</span>
            <strong>${balance.toFixed(2)}</strong>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setPaymentFullName(activeUser.fullName)
              setPaymentMessage('')
              setPaymentError(false)
              setShowPaymentForm(true)
            }}
          >
            Cargar saldo
          </button>

          <FeedbackMessage message={paymentMessage} isError={paymentError} />

          {showPaymentForm && (
            <section className="payment-panel">
              <h2>Cargar saldo</h2>
              <form className="payment-form" onSubmit={handlePayment}>
                <label>
                  Número de tarjeta
                  <input
                    type="text"
                    value={paymentCard}
                    onChange={(event) => setPaymentCard(formatCardNumber(event.target.value))}
                    placeholder="1234 1234 1234 1234"
                    inputMode="numeric"
                    maxLength={19}
                    autoComplete="cc-number"
                  />
                </label>

                <label>
                  Fecha de vencimiento
                  <input
                    type="text"
                    value={paymentExpiration}
                    onChange={(event) => setPaymentExpiration(formatExpiration(event.target.value))}
                    placeholder="12/26"
                    inputMode="numeric"
                    maxLength={5}
                    autoComplete="cc-exp"
                  />
                </label>

                <label>
                  CVV
                  <input
                    type="text"
                    value={paymentCvv}
                    onChange={(event) => setPaymentCvv(onlyDigits(event.target.value, 3))}
                    placeholder="543"
                    inputMode="numeric"
                    maxLength={3}
                    autoComplete="cc-csc"
                  />
                </label>

                <label>
                  Nombre completo
                  <input
                    type="text"
                    value={paymentFullName}
                    onChange={(event) => setPaymentFullName(event.target.value)}
                    autoComplete="cc-name"
                  />
                </label>

                <label>
                  Monto
                  <div className="currency-input">
                    <span>$</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(event) => setPaymentAmount(event.target.value)}
                      placeholder="100.00"
                      inputMode="decimal"
                    />
                  </div>
                </label>

                <label>
                  Escenario
                  <select
                    value={simulationMode}
                    onChange={(event) => setSimulationMode(event.target.value as SimulationMode)}
                  >
                    <option value="normal">Cobro normal</option>
                    <option value="system_error">Error del sistema</option>
                    <option value="timeout">Timeout</option>
                  </select>
                </label>

                <div className="payment-actions">
                  <button className="primary-button" type="submit" disabled={isCharging}>
                    {isCharging ? 'Procesando...' : 'Enviar recarga'}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      clearPaymentForm()
                      setShowPaymentForm(false)
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}

          <div className="chart-grid">
            <section className="chart-panel">
              <h2>Apuestas</h2>
              <div
                className="donut-chart"
                style={{
                  background: `conic-gradient(#5271ff 0 ${wonPercentage}%, #e5e9ef ${wonPercentage}% 100%)`,
                }}
              >
                <div className="donut-center">
                  <strong>{totalBets}</strong>
                  <span>Total</span>
                </div>
              </div>
              <div className="legend">
                <span><i className="legend-dot won-dot" />Ganadas: {bettingStats.won}</span>
                <span><i className="legend-dot lost-dot" />Perdidas: {bettingStats.lost}</span>
              </div>
            </section>

            <section className="chart-panel">
              <h2>Victorias por caracol</h2>
              <div className="bar-chart">
                {raceWins.map((race) => (
                  <div className="bar-item" key={race.name}>
                    <div className="bar-value">{race.wins}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ height: `${(race.wins / highestWins) * 100}%` }}
                      />
                    </div>
                    <span>{race.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <button className="secondary-button" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </section>
      </main>
    )
  }

  const isRegistering = mode === 'register'

  return (
    <main className="app-shell">
      <section className="card auth-card">
        <p className="eyebrow">Carreras de caracoles</p>
        <h1>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p className="muted">
          {isRegistering
            ? 'Registra tus datos para comenzar.'
            : 'Ingresa con tus datos registrados.'}
        </p>

        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          {isRegistering && (
            <label>
              Nombre completo
              <input
                type="text"
                value={fullName}
                onChange={(event) => handleInputChange(event, setFullName)}
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => handleInputChange(event, setEmail)}
              autoComplete="email"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => handleInputChange(event, setPassword)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
          </label>

          {isRegistering && (
            <label>
              Confirmar contraseña
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => handleInputChange(event, setConfirmPassword)}
                autoComplete="new-password"
              />
            </label>
          )}

          <FeedbackMessage message={message} isError={isError} />

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Procesando...'
              : isRegistering
                ? 'Registrarme'
                : 'Ingresar'}
          </button>
        </form>

        <button
          className="link-button"
          type="button"
          onClick={() => changeMode(isRegistering ? 'login' : 'register')}
        >
          {isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
        </button>
      </section>
    </main>
  )
}

export default App
