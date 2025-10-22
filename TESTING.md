# Guía de Pruebas Locales - DolarDeHoy

## Requisitos
- Docker instalado
- Node.js instalado
- npm instalado

## Paso 1: Iniciar Dragonfly con Docker

```bash
# Iniciar Dragonfly en segundo plano
docker-compose up -d

# Verificar que está corriendo
docker ps
```

Deberías ver un contenedor llamado `dolar-dehoy-dragonfly` corriendo.

## Paso 2: Iniciar el servidor de desarrollo de Next.js

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor debería estar corriendo en http://localhost:3000

## Paso 3: Poblar la base de datos con tasas iniciales

Abre otra terminal y ejecuta:

```bash
# Windows (PowerShell/CMD)
curl http://localhost:3000/api/update-rates

# O usando un navegador, visita:
# http://localhost:3000/api/update-rates
```

Deberías ver una respuesta JSON como:
```json
{
  "success": true,
  "data": {
    "bcv": 52.50,
    "binance": 54.08,
    "updated_at": "2025-10-22T..."
  }
}
```

## Paso 4: Verificar que las tasas se guardaron

```bash
curl http://localhost:3000/api/rates
```

Deberías ver las mismas tasas que acabas de guardar.

## Paso 5: Probar el frontend

Abre tu navegador en http://localhost:3000

- Deberías ver las tasas cargadas automáticamente
- Ingresa un monto en dólares (ej: 100)
- Verás la conversión en tiempo real

## Comandos útiles de Docker

```bash
# Ver logs de Dragonfly
docker logs dolar-dehoy-dragonfly

# Detener Dragonfly
docker-compose down

# Detener y eliminar datos
docker-compose down -v

# Reiniciar Dragonfly
docker-compose restart
```

## Conectarse a Dragonfly (opcional)

```bash
# Entrar al contenedor
docker exec -it dolar-dehoy-dragonfly redis-cli -a your_password_here

# Comandos útiles dentro de redis-cli:
# HGETALL tasas          - Ver todas las tasas guardadas
# GET tasa:bcv           - Ver tasa BCV
# GET tasa:binance       - Ver tasa Binance
# KEYS *                 - Ver todas las llaves
# FLUSHALL               - Borrar toda la base de datos (cuidado!)
```

## Simulación de Cron Job (actualización cada hora)

Para simular el cron job que actualizará las tasas cada hora:

```bash
# Ejecutar manualmente cada vez que quieras actualizar
curl http://localhost:3000/api/update-rates
```

En producción, Coolify ejecutará esto automáticamente cada hora.

## Troubleshooting

### Error: "Connection refused to Dragonfly"
- Verifica que Docker esté corriendo: `docker ps`
- Verifica que el puerto 6379 no esté ocupado
- Revisa los logs: `docker logs dolar-dehoy-dragonfly`

### Error: "Authentication failed"
- Verifica que la password en `.env.local` coincida con `docker-compose.yml`

### Las tasas no se actualizan
- Verifica que llamaste a `/api/update-rates` primero
- Revisa la consola del navegador para errores
- Revisa los logs del servidor Next.js
