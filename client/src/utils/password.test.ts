import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password helpers', () => {
  it('genera el mismo hash para la misma contraseña', async () => {
    const firstHash = await hashPassword('hola123')
    const secondHash = await hashPassword('hola123')

    expect(firstHash).toBe(secondHash)
  })

  it('genera hashes diferentes para contraseñas diferentes', async () => {
    const firstHash = await hashPassword('hola123')
    const secondHash = await hashPassword('adios123')

    expect(firstHash).not.toBe(secondHash)
  })

  it('acepta la contraseña correcta', async () => {
    const passwordHash = await hashPassword('hola123')

    await expect(verifyPassword('hola123', passwordHash)).resolves.toBe(true)
  })

  it('rechaza una contraseña incorrecta', async () => {
    const passwordHash = await hashPassword('hola123')

    await expect(verifyPassword('adios123', passwordHash)).resolves.toBe(false)
  })
})
