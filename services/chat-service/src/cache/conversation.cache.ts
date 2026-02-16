import { getRedisClient } from '@/clients/redis.client';
import { Conversation } from '@/types/conversation';

const CACHE_PREFIX = 'conversation:';
const CACHE_TTL_SECONDS = 60;

const serialize = (conversation: Conversation): string => {
  return JSON.stringify({
    ...conversation,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  });
};

const deserialize = (data: string): Conversation => {
  const parsed = JSON.parse(data) as Conversation & {
    createdAt: string;
    updatedAt: string;
  };

  return {
    ...parsed,
    createdAt: new Date(parsed.createdAt),
    updatedAt: new Date(parsed.updatedAt),
  };
};

export const conversationCache = {
  async get(conversationId: string): Promise<Conversation | null> {
    const client = await getRedisClient();
    const data = await client.get(CACHE_PREFIX + conversationId);
    return data ? deserialize(data) : null;
  },

  async set(conversation: Conversation): Promise<void> {
    const client = await getRedisClient();
    await client.setex(CACHE_PREFIX + conversation.id, CACHE_TTL_SECONDS, serialize(conversation));
  },

  async delete(conversationId: string): Promise<void> {
    const client = await getRedisClient();
    await client.del(CACHE_PREFIX + conversationId);
  },
};
