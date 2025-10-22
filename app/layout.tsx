import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "http://o8ssws0g00so8ks0k08swk8o.104.223.65.173.sslip.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DolarDeHoy - Calculadora de Dólar a Bolívares Venezuela 2025",
    template: "%s | DolarDeHoy"
  },
  description: "Calcula el precio del dólar en Venezuela hoy. Tasas actualizadas del BCV y Binance P2P en tiempo real. Convierte USD a Bs y Bs a USD al instante. ¡Gratis!",
  keywords: [
    // Palabras clave principales
    "dolar hoy venezuela",
    "precio dolar venezuela",
    "tasa bcv",
    "dolar bcv hoy",
    "binance venezuela",
    "calculadora dolar bolivar",

    // Long-tail keywords
    "cuanto esta el dolar en venezuela",
    "precio del dolar hoy",
    "cambio de dolar a bolivares",
    "tasa de cambio venezuela",
    "convertir dolares a bolivares",
    "convertir bolivares a dolares",

    // Marcas y servicios
    "banco central de venezuela",
    "bcv tasas",
    "binance p2p venezuela",
    "usdt venezuela",

    // Variaciones
    "dolar venezuela 2025",
    "dolar paralelo venezuela",
    "monitor dolar",
    "calculadora dolar",
  ],
  authors: [{ name: "DolarDeHoy" }],
  creator: "DolarDeHoy",
  publisher: "DolarDeHoy",
  manifest: "/manifest.json",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: siteUrl,
    siteName: "DolarDeHoy",
    title: "DolarDeHoy - Precio del Dólar en Venezuela Hoy",
    description: "Calcula el precio del dólar en Venezuela con tasas actualizadas del BCV y Binance P2P. Conversión USD a Bs en tiempo real.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DolarDeHoy - Calculadora de Dólar Venezuela",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "DolarDeHoy - Precio del Dólar en Venezuela",
    description: "Tasas del BCV y Binance P2P actualizadas. Convierte USD a Bs al instante.",
    images: ["/og-image.png"],
    creator: "@DolarDeHoy",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Otros
  alternates: {
    canonical: siteUrl,
  },
  category: "finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
