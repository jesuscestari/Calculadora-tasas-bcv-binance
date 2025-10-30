'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Euro, Instagram } from 'lucide-react';

export default function Home() {
  const [amount, setAmount] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [tasaBCV, setTasaBCV] = useState<number>(0);
  const [tasaBinance, setTasaBinance] = useState<number>(0);
  const [tasaEuro, setTasaEuro] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isUsdToBs, setIsUsdToBs] = useState<boolean>(true); // true = USD->Bs, false = Bs->USD
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const [previousRates, setPreviousRates] = useState<{bcv: number, binance: number, euro: number} | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [animatedValues, setAnimatedValues] = useState<{bcv: string, binance: string, euro: string}>({
    bcv: '0.00',
    binance: '0.00',
    euro: '0.00'
  });

  useEffect(() => {
    // Aplicar el tema al cargar - optimizado para evitar reflow
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('light');
    } else {
      html.classList.add('light');
    }
  }, [isDark]);

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Obtener tasas al cargar la página
    fetchRates();
    
    // Cargar tasas previas desde localStorage
    const savedRates = localStorage.getItem('previousRates');
    if (savedRates) {
      try {
        setPreviousRates(JSON.parse(savedRates));
      } catch (e) {
        console.error('Error loading previous rates:', e);
      }
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/rates');
      const data = await response.json();

      if (data.success) {
        // Guardar tasas previas antes de actualizar
        if (tasaBCV > 0 || tasaBinance > 0) {
          localStorage.setItem('previousRates', JSON.stringify({
            bcv: tasaBCV,
            binance: tasaBinance,
            euro: tasaEuro
          }));
          setPreviousRates({
            bcv: tasaBCV,
            binance: tasaBinance,
            euro: tasaEuro
          });
        }
        
        setTasaBCV(data.data.bcv);
        setTasaBinance(data.data.binance);
        setTasaEuro(data.data.euro);
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
    const euroResult = calculateConversion(tasaEuro);

    let text = '';
    if (isUsdToBs) {
      text = `💵 DolarDeHoy - Conversión de $${formatNumber(amount)} USD:\n\n` +
             `🏦 BCV: ${formatNumber(bcvResult)} Bs\n` +
             `💰 Binance P2P: ${formatNumber(binanceResult)} Bs\n` +
             `💶 Euro: ${formatNumber(euroResult)} Bs\n\n`

    } else {
      text = `💵 DolarDeHoy - Conversión de ${formatNumber(amount)} Bs:\n\n` +
             `🏦 BCV: $${formatNumber(bcvResult)} USD\n` +
             `💰 Binance P2P: $${formatNumber(binanceResult)} USD\n` +
             `💶 Euro: €${formatNumber(euroResult)}\n\n`
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
    return num.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getRateChange = (current: number, previous: number | null): { value: number, percentage: number, isUp: boolean } | null => {
    if (!previous || previous === 0) return null;
    const change = current - previous;
    const percentage = ((change / previous) * 100);
    return {
      value: Math.abs(change),
      percentage: Math.abs(percentage),
      isUp: change > 0
    };
  };

  const getDifferenceBetweenRates = (rate1: number, rate2: number): { value: number, percentage: number } => {
    if (rate1 === 0 || rate2 === 0) return { value: 0, percentage: 0 };
    const diff = Math.abs(rate1 - rate2);
    const percentage = ((diff / Math.min(rate1, rate2)) * 100);
    return { value: diff, percentage };
  };

  const quickAmounts = [10, 15, 20, 25, 50, 100, 500, 1000];

  const setQuickAmount = (amount: number) => {
    setAmount(amount.toString());
    // Feedback táctil en móviles
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Gestos táctiles para cambiar dirección
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // Cambiar dirección con swipe
      toggleDirection();
      // Feedback táctil
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    }
  };

  // Memoize calculations to prevent unnecessary re-renders
  const bcvResult = useMemo(() => calculateConversion(tasaBCV), [amount, tasaBCV, isUsdToBs]);
  const binanceResult = useMemo(() => calculateConversion(tasaBinance), [amount, tasaBinance, isUsdToBs]);
  const euroResult = useMemo(() => calculateConversion(tasaEuro), [amount, tasaEuro, isUsdToBs]);

  // Animación de números (conteo animado)
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      setAnimatedValues({ bcv: '0.00', binance: '0.00', euro: '0.00' });
      return;
    }

    const animateValue = (start: number, end: number, duration: number, callback: (value: string) => void) => {
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        callback(current.toFixed(2));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    const startBcv = parseFloat(animatedValues.bcv.replace(/,/g, '')) || 0;
    const endBcv = parseFloat(bcvResult.replace(/,/g, '')) || 0;
    const startBinance = parseFloat(animatedValues.binance.replace(/,/g, '')) || 0;
    const endBinance = parseFloat(binanceResult.replace(/,/g, '')) || 0;
    const startEuro = parseFloat(animatedValues.euro.replace(/,/g, '')) || 0;
    const endEuro = parseFloat(euroResult.replace(/,/g, '')) || 0;

    animateValue(startBcv, endBcv, 600, (value) => {
      setAnimatedValues(prev => ({ ...prev, bcv: formatNumber(value) }));
    });
    animateValue(startBinance, endBinance, 600, (value) => {
      setAnimatedValues(prev => ({ ...prev, binance: formatNumber(value) }));
    });
    animateValue(startEuro, endEuro, 600, (value) => {
      setAnimatedValues(prev => ({ ...prev, euro: formatNumber(value) }));
    });
  }, [bcvResult, binanceResult, euroResult, amount]);

  return (
    <>
      {/* Structured Data (JSON-LD) para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "DolarDeHoy",
            "description": "Calculadora en tiempo real de dólares a bolívares con tasas BCV y Binance P2P Venezuela",
            "url": "https://dolardehoy.app",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "250"
            },
            "inLanguage": "es-VE",
            "about": {
              "@type": "Thing",
              "name": "Tasa de Cambio Venezuela",
              "description": "Conversión de dólares a bolívares venezolanos"
            }
          })
        }}
      />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        {/* Botón de toggle de tema */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-lg transition-all hover:scale-110 touch-manipulation"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            minWidth: isMobile ? '44px' : 'auto',
            minHeight: isMobile ? '44px' : 'auto',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Toggle theme"
          title="Cambiar tema"
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
      </div>

      {/* Contenido principal */}
      <div className="w-full max-w-2xl">
        {/* Header Profesional */}
        <div className="text-center mb-8 mt-16 sm:mt-8">
          {/* Logo y Título en contenedor elegante */}
          <div className="flex flex-col items-center gap-4 mb-4">
            {/* Logo con contenedor profesional */}
            <div 
              className="relative rounded-2xl transition-all duration-300"
              style={{
                padding: isMobile ? '0.75rem' : '1rem',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                boxShadow: isDark 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Image
                src="/logo1.png"
                alt="DolarDeHoy Logo"
                width={isMobile ? 60 : 80}
                height={isMobile ? 60 : 80}
                priority
                className="object-contain select-none pointer-events-none transition-transform duration-300"
                style={{
                  filter: isDark ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                }}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            
            {/* Título mejorado */}
            <div className="space-y-2">
              <h1 
                className="font-bold tracking-tight"
                style={{
                  fontSize: isMobile ? '2.5rem' : '3.75rem',
                  background: isDark 
                    ? 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)'
                    : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1',
                }}
              >
                DolarDeHoy
              </h1>
              {/* Banda de colores de Venezuela */}
              <div className="flex h-1 w-24 mx-auto rounded-full overflow-hidden">
                <div className="flex-1" style={{ backgroundColor: '#FCD116' }}></div>
                <div className="flex-1" style={{ backgroundColor: '#003893' }}></div>
                <div className="flex-1" style={{ backgroundColor: '#CE1126' }}></div>
              </div>
            </div>
          </div>
          
          {/* Subtítulo mejorado */}
          <h2 
            className="text-lg sm:text-xl font-medium mb-2" 
            style={{ 
              color: isDark ? '#9ca3af' : '#64748b',
              letterSpacing: '0.01em',
            }}
          >
            Calculadora de tasas actualizadas en tiempo real
          </h2>
          <p 
            className="text-sm" 
            style={{ 
              color: isDark ? '#6b7280' : '#94a3b8',
            }}
          >
            BCV • Binance P2P • Euro
          </p>
        </div>

        {/* Input de conversión */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="amount" className="block text-sm font-medium">
              {isUsdToBs ? 'Monto en Dólares (USD)' : 'Monto en Bolívares (Bs)'}
            </label>
            <button
              onClick={toggleDirection}
              className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all hover:scale-105 touch-manipulation"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                minHeight: isMobile ? '44px' : 'auto',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span>{isUsdToBs ? 'USD → Bs' : 'Bs → USD'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
          <div 
            className="relative mb-3"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
              {isUsdToBs ? '$' : 'Bs'}
            </span>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-4 text-2xl rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: 'var(--input-bg)',
                border: '1px solid var(--border)',
                fontSize: isMobile ? '1.5rem' : '1.875rem',
                paddingTop: isMobile ? '0.875rem' : '1rem',
                paddingBottom: isMobile ? '0.875rem' : '1rem',
              }}
              min="0"
              step="0.01"
            />
            {isMobile && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                ← swipe →
              </div>
            )}
          </div>
          {/* Botones rápidos de montos - Solo se muestran cuando es USD → Bs */}
          {isUsdToBs && (
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setQuickAmount(quickAmount)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                  style={{
                    backgroundColor: amount === quickAmount.toString() ? 'var(--foreground)' : 'var(--card-bg)',
                    color: amount === quickAmount.toString() ? 'var(--background)' : 'var(--foreground)',
                    border: '1px solid var(--border)',
                    minHeight: isMobile ? '44px' : 'auto', // Tamaño mínimo táctil recomendado
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  ${quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Resumen comparativo */}
        {!loading && amount && parseFloat(amount) > 0 && (
          <div className="mb-6 p-4 rounded-lg animate-fade-in" style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
          }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm mb-1" style={{ color: isDark ? '#6b7280' : '#64748b' }}>Mejor tasa disponible</p>
                <p className="text-xl font-bold">
                  {isUsdToBs ? (
                    tasaBinance > tasaBCV ? (
                      <>Binance P2P: <span className="text-yellow-500">{formatNumber(binanceResult)} Bs</span></>
                    ) : (
                      <>BCV: <span className="text-green-500">{formatNumber(bcvResult)} Bs</span></>
                    )
                  ) : (
                    tasaBinance > tasaBCV ? (
                      <>BCV: <span className="text-green-500">${formatNumber(bcvResult)}</span></>
                    ) : (
                      <>Binance P2P: <span className="text-yellow-500">${formatNumber(binanceResult)}</span></>
                    )
                  )}
                </p>
              </div>
              {isUsdToBs && tasaBinance > tasaBCV && (
                <div className="text-right">
                  <p className="text-xs" style={{ color: isDark ? '#6b7280' : '#64748b' }}>Diferencia adicional</p>
                  <p className="text-lg font-semibold text-green-500">
                    +{formatNumber((parseFloat(binanceResult) - parseFloat(bcvResult)).toFixed(2))} Bs
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tarjetas de conversión */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tarjeta BCV */}
          <div
            className="p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in touch-manipulation relative overflow-hidden"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, var(--card-bg) 0%, rgba(34, 197, 94, 0.05) 100%)'
                : 'linear-gradient(135deg, var(--card-bg) 0%, rgba(34, 197, 94, 0.12) 100%)',
              border: isDark 
                ? '1px solid rgba(34, 197, 94, 0.2)'
                : '1px solid rgba(34, 197, 94, 0.3)',
              animationDelay: '0.1s',
              padding: isMobile ? '1rem' : '1.5rem',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Skeleton loader */}
            {loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            )}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                {loading ? (
                  <div className="w-10 h-10 rounded-lg animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></div>
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Image
                      src="/bcv.webp"
                      alt="BCV Logo"
                      width={40}
                      height={40}
                      loading="eager"
                      className="rounded-lg object-contain select-none pointer-events-none transition-transform duration-300 hover:rotate-12"
                      style={{
                        filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0)',
                      }}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                )}
                {loading ? (
                  <div className="w-24 h-5 rounded animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></div>
                ) : (
                  <h3 className="text-lg font-semibold">Tasa BCV</h3>
                )}
              </div>
              {!loading && <span className="text-sm" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>Oficial</span>}
            </div>
            <div className="mb-2 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-32 h-5 rounded animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></span>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400 font-mono tabular-nums">
                    Tasa: {tasaBCV.toFixed(2)} Bs/$
                  </p>
                )}
              </div>
              {/* Badge de diferencia con Binance */}
              {!loading && tasaBCV > 0 && tasaBinance > 0 && (() => {
                const diff = getDifferenceBetweenRates(tasaBCV, tasaBinance);
                if (diff.percentage > 0.1) {
                  return (
                    <p className="text-xs mt-1" style={{ color: isDark ? '#6b7280' : '#64748b' }}>
                      {tasaBCV < tasaBinance ? '↓' : '↑'} {diff.percentage.toFixed(1)}% vs Binance
                    </p>
                  );
                }
                return null;
              })()}
            </div>
            <div className="flex items-baseline gap-2 transition-all duration-300">
              <span 
                className="text-3xl font-bold font-mono tabular-nums transition-all duration-300" 
                style={{ color: 'var(--foreground)' }}
              >
                {loading ? (
                  <span className="inline-block w-24 h-10 rounded animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></span>
                ) : (
                  <span className="inline-block animate-pulse-on-change">{animatedValues.bcv || formatNumber(bcvResult)}</span>
                )}
              </span>
              <span className="text-lg" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>{isUsdToBs ? 'Bs' : 'USD'}</span>
            </div>
          </div>

          {/* Tarjeta Binance */}
          <div
            className="p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in touch-manipulation relative overflow-hidden"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, var(--card-bg) 0%, rgba(234, 179, 8, 0.05) 100%)'
                : 'linear-gradient(135deg, var(--card-bg) 0%, rgba(234, 179, 8, 0.12) 100%)',
              border: isDark 
                ? '1px solid rgba(234, 179, 8, 0.2)'
                : '1px solid rgba(234, 179, 8, 0.3)',
              animationDelay: '0.2s',
              padding: isMobile ? '1rem' : '1.5rem',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Skeleton loader */}
            {loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            )}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                {loading ? (
                  <div className="w-10 h-10 rounded-lg animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></div>
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Image
                      src="/binance.webp"
                      alt="Binance Logo"
                      width={40}
                      height={40}
                      loading="eager"
                      className="rounded-lg object-contain select-none pointer-events-none transition-transform duration-300 hover:rotate-12"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                )}
                {loading ? (
                  <div className="w-28 h-5 rounded animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></div>
                ) : (
                  <h3 className="text-lg font-semibold">Tasa Binance</h3>
                )}
              </div>
              {!loading && <span className="text-sm" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>P2P</span>}
            </div>
            <div className="mb-2 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-32 h-5 rounded animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></span>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 font-mono tabular-nums">
                    Tasa: {tasaBinance.toFixed(2)} Bs/$
                  </p>
                )}
              </div>
              {/* Badge destacando que es mejor que BCV */}
              {!loading && tasaBCV > 0 && tasaBinance > 0 && tasaBinance > tasaBCV && (
                <p className="text-xs text-green-500 mt-1 font-medium">
                  ↑ {getDifferenceBetweenRates(tasaBCV, tasaBinance).percentage.toFixed(1)}% mejor que BCV
                </p>
              )}
            </div>
            <div className="flex items-baseline gap-2 transition-all duration-300 relative z-10">
              <span 
                className="text-3xl font-bold font-mono tabular-nums transition-all duration-300" 
                style={{ color: 'var(--foreground)' }}
              >
                {loading ? (
                  <span className="inline-block w-24 h-10 rounded animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></span>
                ) : (
                  <span className="inline-block animate-pulse-on-change">{animatedValues.binance || formatNumber(binanceResult)}</span>
                )}
              </span>
              <span className="text-lg" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>{isUsdToBs ? 'Bs' : 'USD'}</span>
            </div>
          </div>

          {/* Tarjeta Euro */}
          <div
            className="p-6 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in touch-manipulation relative overflow-hidden"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, var(--card-bg) 0%, rgba(59, 130, 246, 0.05) 100%)'
                : 'linear-gradient(135deg, var(--card-bg) 0%, rgba(59, 130, 246, 0.12) 100%)',
              border: isDark 
                ? '1px solid rgba(59, 130, 246, 0.2)'
                : '1px solid rgba(59, 130, 246, 0.3)',
              animationDelay: '0.3s',
              padding: isMobile ? '1rem' : '1.5rem',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Skeleton loader */}
            {loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            )}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                {loading ? (
                  <div className="w-10 h-10 rounded-lg animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></div>
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Euro className="w-8 h-8" />
                  </div>
                )}
                {loading ? (
                  <div className="w-20 h-8 rounded animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></div>
                ) : (
                  <h3 className="text-lg font-semibold">Tasa <br />Euro</h3>
                )}
              </div>
              {!loading && <span className="text-sm" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>EUR</span>}
            </div>
            <div className="mb-2 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-32 h-5 rounded animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></span>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                    Tasa: {tasaEuro.toFixed(2)} Bs/€
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-2 transition-all duration-300 relative z-10">
              <span 
                className="text-3xl font-bold font-mono tabular-nums transition-all duration-300" 
                style={{ color: 'var(--foreground)' }}
              >
                {loading ? (
                  <span className="inline-block w-24 h-10 rounded animate-pulse" style={{ backgroundColor: isDark ? '#374151' : '#e2e8f0' }}></span>
                ) : (
                  <span className="inline-block animate-pulse-on-change">{animatedValues.euro || formatNumber(euroResult)}</span>
                )}
              </span>
              <span className="text-lg" style={{ color: isDark ? '#9ca3af' : '#64748b' }}>{isUsdToBs ? 'Bs' : 'EUR'}</span>
            </div>
          </div>
        </div>

        {/* Botón de compartir - Solo aparece cuando hay un monto */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mt-6 flex justify-center animate-fade-in">
            <button
              onClick={shareResults}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '2px solid var(--border)',
                minHeight: isMobile ? '48px' : 'auto',
                WebkitTapHighlightColor: 'transparent',
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
            <p className="text-lg font-semibold" style={{ color: isDark ? '#4b5563' : '#475569' }}>
              Última actualización: <br className="sm:hidden" />
              {new Date(lastUpdated).toLocaleString('es-VE', {
                timeZone: 'America/Caracas',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })} <span className="font-bold">(Venezuela)</span>
            </p>
          )}
        </div>

        {/* Mensaje de amor para Venezuela */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Hecho con</span>
              <span className="text-red-500 text-lg animate-pulse">❤️</span>
              <span>para Venezuela</span>
            </div>
            <a
              href="https://www.instagram.com/dolardehoy.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
              aria-label="Síguenos en Instagram"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-sm">@dolardehoy.app</span>
            </a>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}
