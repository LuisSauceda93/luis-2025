# Aplicación web full-stack

Aplicación web desarrollada con React, TypeScript y Express para gestionar usuarios, sesiones, saldo y pagos simulados.

## Objetivo

Construir una aplicación funcional con autenticación local, dashboard informativo y una integración simulada con un proveedor de pagos.

## Tecnologías utilizadas

- React
- TypeScript
- Express
- HTML y CSS
- LocalStorage
- Git y GitHub

## Funcionalidades

- Registro de usuario.
- Inicio y cierre de sesión.
- Persistencia de sesión mediante LocalStorage.
- Dashboard con información del usuario.
- Consulta y actualización del saldo.
- Estadísticas simuladas.
- Recarga de saldo mediante un proveedor de pagos simulado.
- Validación de datos y manejo de errores.

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

## Instalación y ejecución

Próximamente se documentarán los pasos para instalar dependencias y ejecutar el frontend y backend.

## Pruebas

Se documentarán las pruebas realizadas para validar:

- Registro e inicio de sesión.
- Persistencia de sesión.
- Actualización del saldo.
- Respuestas aprobadas y rechazadas.
- Manejo de errores.

## Uso de herramientas de inteligencia artificial

Se utilizó inteligencia artificial como apoyo para analizar requisitos, revisar decisiones técnicas, detectar errores y mejorar la documentación. Todo el código fue revisado, probado y comprendido antes de su entrega.

## Funcionalidades pendientes

Las funcionalidades pendientes se documentarán conforme avance el desarrollo.

## Tiempo aproximado de desarrollo

El tiempo de desarrollo se agregará al finalizar el proyecto.