'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [amount, setAmount] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [tasaBCV, setTasaBCV] = useState<number>(0);
  const [tasaBinance, setTasaBinance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isUsdToBs, setIsUsdToBs] = useState<boolean>(true); // true = USD->Bs, false = Bs->USD
  const [showCopied, setShowCopied] = useState<boolean>(false);

  useEffect(() => {
    // Aplicar el tema al cargar
    if (isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  useEffect(() => {
    // Obtener tasas al cargar la página
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rates');
      const data = await response.json();

      if (data.success) {
        setTasaBCV(data.data.bcv);
        setTasaBinance(data.data.binance);
        setLastUpdated(data.data.updated_at);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleDirection = () => {
    setIsUsdToBs(!isUsdToBs);
    setAmount(''); // Limpiar el campo al cambiar dirección
  };

  const calculateConversion = (rate: number): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return '0.00';

    if (isUsdToBs) {
      // USD a Bs
      return (numAmount * rate).toFixed(2);
    } else {
      // Bs a USD
      return (numAmount / rate).toFixed(2);
    }
  };

  const shareResults = () => {
    const bcvResult = calculateConversion(tasaBCV);
    const binanceResult = calculateConversion(tasaBinance);

    let text = '';
    if (isUsdToBs) {
      text = `💵 DolarDeHoy - Conversión de $${formatNumber(amount)} USD:\n\n` +
             `🏦 BCV: ${formatNumber(bcvResult)} Bs\n` +
             `💰 Binance P2P: ${formatNumber(binanceResult)} Bs\n\n` +
             `🔗 Calcula tus tasas en: http://o8ssws0g00so8ks0k08swk8o.104.223.65.173.sslip.io`;
    } else {
      text = `💵 DolarDeHoy - Conversión de ${formatNumber(amount)} Bs:\n\n` +
             `🏦 BCV: $${formatNumber(bcvResult)} USD\n` +
             `💰 Binance P2P: $${formatNumber(binanceResult)} USD\n\n` +
             `🔗 Calcula tus tasas en: http://o8ssws0g00so8ks0k08swk8o.104.223.65.173.sslip.io`;
    }

    // Copiar al portapapeles
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  const formatNumber = (value: string): string => {
    if (!value || value === '0.00') return '0.00';
    const num = parseFloat(value);
    return num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Botón de toggle de tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-lg transition-all hover:scale-110"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
        }}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Contenido principal */}
      <div className="w-full max-w-2xl">
        {/* Título */}
        <h1 className="text-5xl font-bold text-center mb-2">DolarDeHoy</h1>
        <p className="text-center text-gray-400 mb-8">Calculadora de tasas de cambio en tiempo real</p>

        {/* Input de conversión */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="amount" className="block text-sm font-medium">
              {isUsdToBs ? 'Monto en Dólares (USD)' : 'Monto en Bolívares (Bs)'}
            </label>
            <button
              onClick={toggleDirection}
              className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
              }}
            >
              <span>{isUsdToBs ? 'USD → Bs' : 'Bs → USD'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
              {isUsdToBs ? '$' : 'Bs'}
            </span>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-4 text-2xl rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--border)',
              }}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Tarjetas de conversión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta BCV */}
          <div
            className="p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              animationDelay: '0.1s',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <Image
                    src="/bcv.webp"
                    alt="BCV Logo"
                    width={40}
                    height={40}
                    className="rounded-lg object-contain select-none pointer-events-none transition-transform duration-300 hover:rotate-12"
                    style={{
                      filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0)',
                    }}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
                <h2 className="text-lg font-semibold">Tasa BCV</h2>
              </div>
              <span className="text-sm text-gray-400">Oficial</span>
            </div>
            <div className="mb-2">
              <p className="text-sm text-gray-400">
                {loading ? 'Cargando...' : `Tasa: ${tasaBCV.toFixed(2)} Bs/$`}
              </p>
            </div>
            <div className="flex items-baseline gap-2 transition-all duration-300">
              <span className="text-3xl font-bold text-green-500">
                {loading ? '...' : formatNumber(calculateConversion(tasaBCV))}
              </span>
              <span className="text-lg text-gray-400">{isUsdToBs ? 'Bs' : 'USD'}</span>
            </div>
          </div>

          {/* Tarjeta Binance */}
          <div
            className="p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              animationDelay: '0.2s',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <Image
                    src="/binance.webp"
                    alt="Binance Logo"
                    width={40}
                    height={40}
                    className="rounded-lg object-contain select-none pointer-events-none transition-transform duration-300 hover:rotate-12"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
                <h2 className="text-lg font-semibold">Tasa Binance</h2>
              </div>
              <span className="text-sm text-gray-400">P2P</span>
            </div>
            <div className="mb-2">
              <p className="text-sm text-gray-400">
                {loading ? 'Cargando...' : `Tasa: ${tasaBinance.toFixed(2)} Bs/$`}
              </p>
            </div>
            <div className="flex items-baseline gap-2 transition-all duration-300">
              <span className="text-3xl font-bold text-yellow-500">
                {loading ? '...' : formatNumber(calculateConversion(tasaBinance))}
              </span>
              <span className="text-lg text-gray-400">{isUsdToBs ? 'Bs' : 'USD'}</span>
            </div>
          </div>
        </div>

        {/* Botón de compartir - Solo aparece cuando hay un monto */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mt-6 flex justify-center animate-fade-in">
            <button
              onClick={shareResults}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '2px solid var(--border)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{showCopied ? '¡Copiado! ✓' : 'Compartir Resultado'}</span>
            </button>
          </div>
        )}

        {/* Nota informativa */}
        <div className="mt-8 text-center">
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Última actualización: {new Date(lastUpdated).toLocaleString('es-VE', {
                timeZone: 'America/Caracas',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })} <span className="font-semibold">(Hora de Venezuela)</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
