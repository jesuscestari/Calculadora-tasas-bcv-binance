# 💵 DolarDeHoy

> **Calculadora de tasas BCV y Binance P2P en tiempo real para Venezuela**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https://dolardehoy.app-green?style=for-the-badge&logo=vercel)](https://dolardehoy.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](https://docker.com)

Una aplicación web moderna para calcular conversiones de dólares a bolívares venezolanos usando las tasas oficiales del BCV y las tasas P2P de Binance en tiempo real.

![image alt](https://github.com/jesuscestari/Calculadora-tasas-bcv-binance/blob/39b3ff30c63397aa4f6b7db95167e66d8c9c315b/public/live.png)



## ✨ Características

- 🔄 **Conversión bidireccional**: USD ↔ Bs y Bs ↔ USD
- 📊 **Múltiples fuentes de tasas**:
  - 🏦 **Tasa BCV**: Tasa oficial del Banco Central de Venezuela
  - 💰 **Tasa Binance P2P**: Tasa del mercado P2P de Binance
  - 💶 **Tasa Euro**: Conversión EUR a Bs
- ⚡ **Tiempo real**: Tasas actualizadas automáticamente
- 🌙 **Tema oscuro/claro**: Interfaz adaptable
- 📱 **Responsive**: Optimizado para móviles y desktop
- 🔗 **Compartir resultados**: Función para copiar conversiones al portapapeles
- 🚀 **PWA Ready**: Aplicación web progresiva

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Base de datos**: Dragonfly (Redis-compatible)
- **Deployment**: Docker, Docker Compose
- **APIs externas**:
  - [DolarVzla API](https://api.dolarvzla.com/) - Tasas BCV
  - [CriptoYa API](https://criptoya.com/) - Tasas Binance P2P
  - [ExchangeRate API](https://exchangerate.host/) - Tasas EUR/USD

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js >= 20.9.0
- Docker y Docker Compose (opcional)

### Desarrollo Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/calculadora.git
   cd calculadora
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local`:
   ```env
   DRAGONFLY_HOST=localhost
   DRAGONFLY_PORT=6379
   DRAGONFLY_PASSWORD=jesuscestari
   ```

4. **Ejecutar con Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **O ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

6. **Actualizar tasas manualmente**
   ```bash
   npm run update-rates
   ```

### Producción

```bash
# Build de la aplicación
npm run build

# Ejecutar en producción
npm start
```

## 🐳 Docker

### Desarrollo
```bash
docker-compose up -d
```

### Producción
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Estructura del Proyecto

```
calculadora/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── health/        # Health check endpoint
│   │   ├── rates/         # Obtener tasas actuales
│   │   └── update-rates/  # Actualizar tasas desde APIs
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── lib/                   # Utilidades
│   └── dragonfly.ts       # Cliente Dragonfly/Redis
├── public/                # Assets estáticos
├── scripts/               # Scripts de utilidad
├── Dockerfile            # Configuración Docker
├── docker-compose.yml    # Orquestación de servicios
└── package.json          # Dependencias y scripts
```

## 🔧 API Endpoints

### `GET /api/rates`
Obtiene las tasas actuales desde la base de datos.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "bcv": 36.50,
    "binance": 37.20,
    "euro": 39.42,
    "updated_at": "2025-01-27T10:30:00.000Z"
  },
  "cached": true
}
```

### `GET /api/update-rates`
Actualiza las tasas desde las APIs externas.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "bcv": 36.50,
    "binance": 37.20,
    "euro": 39.42,
    "updated_at": "2025-01-27T10:30:00.000Z"
  }
}
```

### `GET /api/health`
Health check del servicio.

## 🎨 Características de la UI

- **Diseño moderno**: Interfaz limpia y minimalista
- **Animaciones suaves**: Transiciones y efectos visuales
- **Tema adaptable**: Modo oscuro y claro
- **Responsive design**: Optimizado para todos los dispositivos
- **Accesibilidad**: Cumple estándares de accesibilidad web
- **SEO optimizado**: Meta tags y structured data

## 🔄 Flujo de Datos

1. **Actualización de tasas**: Cron job o manual trigger
2. **Fetch de APIs**: BCV, Binance P2P, EUR/USD
3. **Almacenamiento**: Dragonfly/Redis cache
4. **Frontend**: Consumo de tasas en tiempo real
5. **Cálculos**: Conversiones instantáneas

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build y run
docker build -t dolar-dehoy .
docker run -p 3000:3000 dolar-dehoy
```

### Variables de entorno requeridas
```env
DRAGONFLY_HOST=your-dragonfly-host
DRAGONFLY_PORT=6379
DRAGONFLY_PASSWORD=your-password
```

## 📊 Monitoreo

- **Health checks**: Endpoint `/api/health`
- **Logs**: Console logs para debugging
- **Métricas**: Tiempo de respuesta de APIs
- **Cache**: Estado de Dragonfly/Redis

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
npm run update-rates # Actualizar tasas manualmente
```

## 🐛 Troubleshooting

### Error de conexión a Dragonfly
```bash
# Verificar que Dragonfly esté corriendo
docker-compose ps

# Revisar logs
docker-compose logs dragonfly
```

### Tasas no se actualizan
```bash
# Verificar APIs externas
curl https://api.dolarvzla.com/public/exchange-rate
curl https://criptoya.com/api/binancep2p/USDT/VES/1
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🌐 Enlaces

- **Live Demo**: [https://dolardehoy.app](https://dolardehoy.app)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/calculadora/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/calculadora/discussions)

## 🙏 Agradecimientos

- [DolarVzla](https://dolarvzla.com/) por la API de tasas BCV
- [CriptoYa](https://criptoya.com/) por la API de Binance P2P
- [ExchangeRate](https://exchangerate.host/) por las tasas EUR/USD
- [Next.js](https://nextjs.org/) por el framework
- [Tailwind CSS](https://tailwindcss.com/) por el sistema de diseño

---

**Hecho con ❤️ para la comunidad venezolana**
