# Especificación de la aplicación

## 1. Objetivo

Construir una aplicación web sencilla sobre carreras de caracoles que permita registrar usuarios, iniciar sesión, consultar un dashboard y cargar saldo mediante una pasarela de pagos simulada.

La aplicación utilizará:

- React y TypeScript para el frontend.
- Express y TypeScript para el backend.
- LocalStorage para conservar el usuario, la sesión y el saldo.

No se procesarán pagos reales ni información financiera real.

## 2. Alcance de la primera versión

### Incluido

- Registro de usuario.
- Inicio y cierre de sesión.
- Persistencia de la sesión después de recargar la página.
- Dashboard protegido por sesión.
- Saldo inicial de `$0`.
- Gráfica de apuestas ganadas y perdidas.
- Gráfica de victorias de seis caracoles.
- Recarga de saldo con un sistema de cobro simulado.
- Manejo de respuestas exitosas y fallidas.
- Pruebas automatizadas básicas.
- Documentación para ejecutar el proyecto.

### Fuera de alcance

- Recuperación de contraseña.
- Verificación de correo electrónico.
- Administración de múltiples usuarios.
- Registro real de carreras.
- Realización de apuestas.
- Base de datos real.
- Procesamiento de pagos reales.

## 3. Flujo de usuario

### Registro

El usuario introduce:

- Nombre completo.
- Correo electrónico.
- Contraseña.
- Confirmación de contraseña.

Validaciones mínimas:

- Todos los campos son obligatorios.
- El correo debe tener un formato válido.
- La contraseña debe cumplir una longitud mínima.
- La confirmación debe coincidir con la contraseña.
- No se debe registrar un correo duplicado.

Al registrarse correctamente:

- Se guarda el usuario localmente.
- El saldo inicial es `$0`.
- Se crea una sesión activa.
- El usuario puede acceder al dashboard.

La contraseña no se guardará en texto plano. Se generará un hash utilizando la API nativa Web Crypto del navegador. Esta solución es únicamente para la simulación local solicitada y no sustituye un sistema de autenticación para producción.

### Inicio de sesión

El usuario introduce su correo y contraseña.

- Si los datos son correctos, se crea la sesión.
- Si son incorrectos, se muestra un mensaje comprensible.
- La sesión debe conservarse al recargar la página.

### Cierre de sesión

Al cerrar sesión:

- Se elimina la sesión activa.
- El usuario regresa a la pantalla de inicio de sesión.
- No se elimina el perfil ni el saldo guardado.

## 4. LocalStorage

Se utilizarán claves claras y separadas:

```text
app_user
app_session
app_balance
app_last_payment
```

El valor de `app_session` conservará únicamente el identificador del usuario activo. No guardará la contraseña ni su confirmación.

El valor de `app_last_payment` conservará los datos ficticios de tarjeta y CVV utilizados en la última operación, porque el alcance del proyecto requiere que estén disponibles localmente. Nunca se utilizarán datos financieros reales.

## 5. Dashboard

El dashboard mostrará:

- Nombre del usuario.
- Saldo actual.
- Botón para cargar saldo.
- Botón para cerrar sesión.
- Gráfica tipo donut con apuestas ganadas y perdidas.
- Gráfica de barras con las victorias de seis caracoles.

Los datos de gráficas serán simulados y constantes. No se implementará una lógica real de carreras o apuestas.

Caracoles simulados:

```text
Turbo, Rayo, Cometa, Relámpago, Flash y Relajado
```

## 6. API del sistema de cobro

### Endpoint

```text
POST /api/SnailPay
```

### Solicitud

La solicitud incluirá:

```text
card_number
expiration_date
cvv
full_name
amount
payer_id
payer_email
simulation_mode
```

### Respuesta

Todas las respuestas incluirán:

```text
id
status
status_detail
transaction_amount
date_created
authorization_code
reference
payer_id
payer_email
card_number
cvv
```

Los valores de `status` serán:

```text
approved
rejected
system_error
```

`simulation_mode` será un campo opcional con uno de estos valores:

```text
normal
system_error
timeout
```

Este campo permite reproducir los escenarios del sistema durante el desarrollo sin utilizar datos ocultos ni tarjetas reales.

### Cobro aprobado

Se aprobará cuando se utilicen:

```text
Número de tarjeta: 1234123412341234
Fecha: 12/26
CVV: 543
Nombre: cualquier valor no vacío
Monto: mayor que cero
```

Después de una respuesta aprobada:

- El frontend aumentará el saldo.
- El saldo se guardará en LocalStorage.
- El dashboard mostrará el nuevo saldo.
- Se mostrará un mensaje de operación aprobada.

### Error de transacción

Se simulará cuando los datos sean inválidos o la tarjeta no coincida con la tarjeta aprobada.

- El saldo no cambia.
- Se muestra el detalle del rechazo.
- No se informa una aprobación falsa.

### Error del sistema

Se simulará enviando `simulation_mode: "system_error"`. El backend responderá inmediatamente con código HTTP `503` y un estado `system_error`.

Durante este escenario:

- El sistema responde con `system_error`.
- No se modifica el saldo.
- Se informa que el sistema no está disponible.

### Timeout

Se simulará enviando `simulation_mode: "timeout"`. El backend retrasará la respuesta más tiempo que el límite permitido por el frontend.

- El frontend muestra un mensaje de espera agotada.
- El frontend cancela la solicitud utilizando un límite de tiempo.
- El saldo no cambia.
- El botón de recarga vuelve a estar disponible.

### Selector de escenarios

Durante el desarrollo, la interfaz podrá mostrar un selector con estas opciones:

- Cobro normal.
- Error de transacción.
- Error del sistema.
- Timeout.

Esto permitirá reproducir cada escenario sin modificar el código.

## 7. Criterios de aceptación

- Un usuario puede registrarse con datos válidos.
- Un usuario no puede registrarse con campos inválidos.
- Un usuario registrado puede iniciar sesión.
- Un usuario puede cerrar sesión.
- La sesión permanece después de recargar.
- Un usuario sin sesión no puede ver el dashboard.
- El saldo inicial es `$0`.
- Un cobro aprobado incrementa el saldo.
- Un cobro rechazado no modifica el saldo.
- Un error del sistema no modifica el saldo.
- Un timeout no modifica el saldo.
- Las respuestas del sistema contienen todos los campos definidos.
- Las instrucciones de ejecución permiten iniciar frontend y backend.

## 8. Orden de implementación

1. Crear la pantalla de registro e inicio de sesión.
2. Agregar validaciones y LocalStorage.
3. Proteger el dashboard y agregar cierre de sesión.
4. Construir el dashboard con datos simulados.
5. Crear el endpoint del sistema de cobro.
6. Conectar la recarga desde React.
7. Agregar errores y timeout.
8. Crear pruebas automatizadas.
9. Completar README y documento PDF.

## 9. Pruebas mínimas

- Registro correcto.
- Registro con correo inválido.
- Contraseñas que no coinciden.
- Inicio de sesión correcto.
- Inicio de sesión con contraseña incorrecta.
- Persistencia después de recargar.
- Cierre de sesión.
- Recarga aprobada.
- Recarga rechazada.
- Error del sistema.
- Timeout.
- Verificación de que el saldo no cambia en operaciones fallidas.

## 10. Decisiones de diseño

- Mantener la autenticación local para respetar el alcance del proyecto.
- Mantener el sistema de cobro como una simulación sin conexión externa.
- Construir las gráficas simuladas con CSS para evitar dependencias innecesarias.
- Usar componentes pequeños y nombres descriptivos.
- Evitar agregar funcionalidades no solicitadas.
- Implementar una fase completa y verificable antes de comenzar la siguiente.
