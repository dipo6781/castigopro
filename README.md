# CastigoPro — Mini-App de Cobranza de Cartera Castigada

Mini-aplicación profesional diseñada específicamente para **cobradores de cartera castigada (NPL / written-off debt)**.

Construida con las mejores prácticas de la industria 2025-2026:

- Priorización por score de recuperabilidad
- Motor de quitas (descuentos) inteligente
- Registro de gestiones y Promise-to-Pay
- Cumplimiento y buenas prácticas integradas
- 100% local-first (funciona offline, datos en el dispositivo)
- PWA instalable en celular

## Características principales

| Feature | Descripción |
|---------|-------------|
| **Cola priorizada** | Ordena cuentas por probabilidad de recupero |
| **Vista 360°** | Datos del deudor + historial completo |
| **Motor de quitas** | Presets 40-80% + oferta personalizada |
| **Gestiones** | Registro multi-canal con resultados |
| **Promise-to-Pay** | Seguimiento de compromisos |
| **Import CSV** | Carga masiva de cartera |
| **Dashboard** | Métricas de recupero y productividad |
| **Compliance** | Recordatorios de horarios y límites |
| **PWA** | Instalable y usable offline |

## Stack tecnológico

- **Next.js 15** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS** + diseño mobile-first
- **Zustand** (estado + persistencia local)
- **Lucide React** (iconos)

## Cómo ejecutar

```bash
# 1. Instalar dependencias
npm install

# 2. Modo desarrollo
npm run dev

# 3. Abrir http://localhost:3000
```

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── cola/page.tsx         # Cola de trabajo
│   ├── caso/[id]/page.tsx   # Detalle de caso + gestiones + quitas
│   ├── importar/page.tsx     # Importación CSV
│   └── config/page.tsx       # Configuración y compliance
├── components/
│   ├── Header.tsx
│   ├── StatsCards.tsx
│   └── DebtorCard.tsx
├── store/
│   └── useAppStore.ts
├── lib/
│   └── utils.ts
└── types/
    └── index.ts
```

## Formato CSV de importación

```csv
nombre,documento,telefono,saldo,fecha_castigo,producto
María González,12345678,+525512345678,18500,2025-11-15,Crédito personal
```

## Mejores prácticas incluidas

- Enfoque en **quitas realistas** (la estrategia más efectiva en cartera castigada)
- Score de recuperabilidad basado en monto + antigüedad del castigo + datos de contacto
- Recordatorios de horarios legales y límites de contacto
- Audit trail completo de todas las gestiones
- Tono profesional y ético en todo el flujo

---

**CastigoPro** — Recupera lo que ya dieron por perdido.
