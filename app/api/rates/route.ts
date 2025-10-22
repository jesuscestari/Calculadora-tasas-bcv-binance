import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/dragonfly';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const redis = getRedisClient();

    // Obtener tasas desde Dragonfly
    const tasas = await redis.hgetall('tasas');

    // Si no hay datos, devolver valores por defecto
    if (!tasas.bcv || !tasas.binance) {
      return NextResponse.json({
        success: true,
        data: {
          bcv: 0,
          binance: 0,
          updated_at: null,
        },
        cached: false,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        bcv: parseFloat(tasas.bcv),
        binance: parseFloat(tasas.binance),
        updated_at: tasas.updated_at,
      },
      cached: true,
    });
  } catch (error) {
    console.error('Error reading rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read rates' },
      { status: 500 }
    );
  }
}
