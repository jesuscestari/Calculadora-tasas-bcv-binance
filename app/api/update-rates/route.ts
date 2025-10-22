import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/dragonfly';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const redis = getRedisClient();

    // 1. Obtener tasa BCV
    const bcvResponse = await fetch('https://api.dolarvzla.com/public/exchange-rate');
    const bcvData = await bcvResponse.json();

    // La API devuelve un objeto con current.usd
    const tasaBCV = bcvData.current?.usd || 0;

    // 2. Obtener tasa Binance P2P desde CriptoYa
    let tasaBinance = 0;

    try {
      const binanceResponse = await fetch('https://criptoya.com/api/binancep2p/USDT/VES/1');
      const binanceData = await binanceResponse.json();

      // Obtenemos el totalAsk (precio de venta)
      tasaBinance = binanceData.totalAsk || 0;
    } catch (error) {
      console.error('Error fetching Binance rate:', error);
      // Fallback: usar un valor ligeramente superior al BCV
      tasaBinance = tasaBCV * 1.03;
    }

    // 3. Guardar en Dragonfly con timestamp
    const timestamp = new Date().toISOString();

    await redis.set('tasa:bcv', tasaBCV.toString());
    await redis.set('tasa:binance', tasaBinance.toString());
    await redis.set('tasa:updated_at', timestamp);

    // 4. También guardamos como hash para tener todo junto
    await redis.hset('tasas', {
      bcv: tasaBCV.toString(),
      binance: tasaBinance.toString(),
      updated_at: timestamp,
    });

    return NextResponse.json({
      success: true,
      data: {
        bcv: tasaBCV,
        binance: tasaBinance,
        updated_at: timestamp,
      },
    });
  } catch (error) {
    console.error('Error updating rates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update rates',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
