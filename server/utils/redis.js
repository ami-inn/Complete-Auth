import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log("Redis Connected");
    return process.env.REDIS_URL;
  }

  throw new Error("Redis Connection Failed");
}

export const redis = new Redis(redisClient());

redis.on('error', (error) => {
  console.error('Redis Error:', error);
});

redis.on('close', () => {
  console.log('Redis Connection Closed');
});
