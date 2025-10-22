import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.DRAGONFLY_HOST || 'localhost',
      port: parseInt(process.env.DRAGONFLY_PORT || '6379'),
      password: process.env.DRAGONFLY_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('error', (err) => {
      console.error('Dragonfly connection error:', err);
    });

    redis.on('connect', () => {
      console.log('Connected to Dragonfly');
    });
  }

  return redis;
}

export default getRedisClient;
