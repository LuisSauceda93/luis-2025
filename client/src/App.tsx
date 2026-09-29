import { useState, type ChangeEvent, type FormEvent } from 'react'
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

const STORAGE_KEYS = {
  user: 'app_user',
  session: 'app_session',
  balance: 'app_balance',
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

  function clearForm() {
    setFullName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
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

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEYS.session)
    setActiveUser(null)
    setMode('login')
    clearForm()
    showMessage('Sesión cerrada.')
  }

  function changeMode(nextMode: FormMode) {
    setMode(nextMode)
    clearForm()
    setMessage('')
  }

  if (activeUser) {
    const balance = Number(localStorage.getItem(STORAGE_KEYS.balance) ?? '0')
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

          {message && (
            <p className={isError ? 'message error-message' : 'message'}>{message}</p>
          )}

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
