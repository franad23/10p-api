# Clase: Checkout Pro con Mercado Pago

## Objetivo

El backend crea una orden propia, genera una preferencia de Checkout Pro y
consulta manualmente el pago desde el historial.

## 1. Configurar Mercado Pago Developers

1. Ingresar en https://www.mercadopago.com.ar/developers/.
2. Abrir **Tus integraciones** y crear una aplicación.
3. Seleccionar **Pagos online** y **Checkout Pro**.
4. Abrir **Credenciales > Prueba**.
5. Copiar el Access Token de prueba en `MP_ACCESS_TOKEN`.

Nunca se debe colocar el Access Token en el frontend ni subir `.env` a Git.

## 2. Variables de entorno

```env
MP_ACCESS_TOKEN=APP_USR-...
APP_URL=https://URL_PUBLICA
```

`APP_URL` es opcional. Para volver automáticamente desde Mercado Pago debe ser
una URL HTTPS pública. Sin ella se puede regresar manualmente a la app local.

## 3. Preparar los datos

El usuario debe estar activo y tener rol `CLIENT`. Luego debe iniciar sesión y
guardar el JWT recibido.

Crear una orden:

```http
POST /order
Authorization: Bearer JWT_DEL_CLIENTE
Content-Type: application/json

{
  "items": [
    {
      "product_id": "ID_DEL_PRODUCTO",
      "quantity": 1
    }
  ]
}
```

El backend obtiene nombre, precio y moneda desde MongoDB. El cliente no puede
decidir el importe que se enviará a Mercado Pago.

## 4. Iniciar Checkout Pro

```http
POST /payment/checkout/ID_DE_LA_ORDEN
Authorization: Bearer JWT_DEL_CLIENTE
```

La respuesta contiene:

```json
{
  "preference_id": "...",
  "init_point": "...",
  "sandbox_init_point": "..."
}
```

Abrir `sandbox_init_point` en una ventana de incógnito.

## 5. Realizar un pago de prueba

Tarjeta Visa de crédito:

```text
Número: 4509 9535 6623 3704
Vencimiento: 11/30
Código: 123
DNI: 12345678
```

El nombre del titular determina el resultado:

- `APRO`: aprobado.
- `OTHE`: rechazado.
- `CONT`: pendiente.

No utilizar tarjetas ni datos personales reales.

## 6. Explicar la verificación

Mercado Pago redirige el navegador a una de estas rutas:

```text
GET /payment/success
GET /payment/pending
GET /payment/failure
```

Estas rutas solamente informan el resultado visual. No modifican la orden.

La consulta manual ocurre así:

1. El cliente presiona **Consultar pago en Mercado Pago**.
2. El frontend llama a `POST /payment/sync/{order_id}`.
3. El backend busca pagos con `/v1/payments/search` y `external_reference`.
4. Verifica `status`, `external_reference`, monto y moneda.
5. Cambia la orden de `PENDING` a `PAID`.
6. Descuenta el stock una sola vez.

Para comprobarlo, consultar el historial:

```http
GET /order/me
Authorization: Bearer JWT_DEL_CLIENTE
```

## 7. Pruebas recomendadas

1. Pago aprobado: la orden termina en `PAID`.
2. Pago rechazado: la orden permanece `PENDING`.
3. Pago pendiente: la orden permanece `PENDING`.
4. Consultar varias veces: el stock no vuelve a descontarse.
5. Intentar pagar una orden ajena: responde `403`.
6. Alterar el precio en el cliente: no cambia el total de la orden.

Documentación oficial:

- https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/overview
- https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/integration-test/test-purchases
- https://www.mercadopago.com.ar/developers/es/reference/online-payments/checkout-pro-preferences/overview
