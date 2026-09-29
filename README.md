# Aplicación web full-stack

Aplicación web desarrollada con React, TypeScript y Express para gestionar usuarios, sesiones, saldo y pagos simulados.

## Objetivo

Construir una aplicación funcional con autenticación local, dashboard informativo y una integración simulada con un proveedor de pagos.

## Tecnologías utilizadas

- React
- TypeScript
- Express
- Vite
- HTML y CSS
- LocalStorage
- Vitest y Node Test Runner
- Git y GitHub

## Funcionalidades

- Registro de usuario.
- Inicio y cierre de sesión.
- Persistencia de sesión mediante LocalStorage.
- Dashboard con información del usuario.
- Consulta y actualización del saldo.
- Estadísticas simuladas.
- Gráfica de apuestas ganadas y perdidas.
- Gráfica de victorias de seis caracoles: Theo, Chicote, Suave, Braza, Sombra y Derrape.
- Recarga de saldo mediante un proveedor de pagos simulado.
- Validación de datos y manejo de errores.

Los datos de carreras y apuestas son simulados. No existe una sección para realizar apuestas ni una lógica para ejecutar carreras.

## Integración con proveedor de pagos simulado

El backend incluye un endpoint que simula una respuesta de procesamiento de pago.

Se contemplan los siguientes escenarios:

- Pago aprobado.
- Pago rechazado.
- Datos inválidos.
- Error del sistema.
- Tiempo de espera agotado.

Las tarjetas utilizadas son ficticias y únicamente sirven para probar el comportamiento de la aplicación.

## Arquitectura

```text
React
  ↓
Fetch
  ↓
Express
  ↓
Proveedor de pagos simulado
```

La información de usuario, sesión y saldo se almacena localmente en el navegador mediante LocalStorage.

Las claves utilizadas son:

```text
app_user
app_session
app_balance
app_last_payment
```

## Requisitos

- Node.js 22 o una versión compatible con las dependencias.
- npm.

Se recomienda usar Node.js `22.22.3`.

## Instalación

Instala las dependencias del servidor:

```bash
cd server
npm install
```

Instala las dependencias del cliente:

```bash
cd ../client
npm install
```

## Ejecución local

En una terminal, inicia el servidor:

```bash
cd server
npm run dev
```

El servidor se ejecuta en `http://localhost:3000`.

En otra terminal, inicia el cliente:

```bash
cd client
npm run dev
```

El cliente se ejecuta normalmente en `http://localhost:5173`.

## Endpoint de recarga

```text
POST http://localhost:3000/api/SnailPay
```

Header requerido:

```text
Content-Type: application/json
```

Datos válidos para una respuesta aprobada:

```json
{
  "card_number": "1234123412341234",
  "expiration_date": "12/26",
  "cvv": "543",
  "full_name": "Usuario de prueba",
  "amount": 100,
  "payer_id": "id-del-usuario",
  "payer_email": "usuario@example.com",
  "simulation_mode": "normal"
}
```

Escenarios disponibles:

| Escenario | Cómo se provoca | Resultado esperado |
| --- | --- | --- |
| Aprobado | Datos válidos y `simulation_mode: "normal"` | HTTP `200`, saldo actualizado |
| Tarjeta rechazada | Usar otros datos de tarjeta | HTTP `402`, saldo sin cambios |
| Datos inválidos | Monto igual o menor que cero o nombre vacío | HTTP `400`, saldo sin cambios |
| Error del sistema | `simulation_mode: "system_error"` | HTTP `503`, saldo sin cambios |
| Timeout | `simulation_mode: "timeout"` | El cliente cancela la solicitud por demora |

Todas las respuestas contienen `id`, `status`, `status_detail`, `transaction_amount`, `date_created`, `authorization_code`, `reference`, `payer_id`, `payer_email`, `card_number` y `cvv`.

`authorization_code` contiene un valor únicamente cuando el pago fue aprobado. En rechazos y errores del sistema su valor es `null`.

El número de tarjeta y el CVV son ficticios y se guardan en `app_last_payment` dentro de LocalStorage.

## Pruebas automatizadas

Pruebas del cliente:

```bash
cd client
npm test
```

Validan el hash y la verificación de contraseñas correctas e incorrectas.

Pruebas del servidor:

```bash
cd server
npm test
```

Validan los escenarios aprobado, tarjeta rechazada, datos inválidos, error del sistema y timeout.

## Compilación

```bash
cd client
npm run build
```

```bash
cd server
npm run build
```

## Uso de herramientas de inteligencia artificial

Se utilizó inteligencia artificial como apoyo para analizar requisitos, revisar decisiones técnicas, detectar errores y mejorar la documentación. Todo el código fue revisado, probado y comprendido antes de su entrega.

## Estado del proyecto

La funcionalidad solicitada está implementada y probada localmente. No quedan funcionalidades del alcance principal pendientes.
