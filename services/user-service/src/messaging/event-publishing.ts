import {
  USER_EVENT_EXCHANGE,
  USER_CREATED_ROUTING_KEY,
  type UserCreatedPayload,
  UserCreatedEvent,
} from '@chat-youapp/common';

import { connect, type Connection, type Channel, type ChannelModel } from 'amqplib';

import { env } from '@/config/env';
import { logger } from '@/utils/logger';

type ManageConnection = Connection & Pick<ChannelModel, 'close' | 'createChannel'>;

let connectionRef: ManageConnection | null = null;
let channelRef: Channel | null = null;

const messagingEnabled = Boolean(env.RABBITMQ_URL);

const ensureChannel = async (): Promise<Channel | null> => {
  if (!messagingEnabled) {
    return null;
  }

  if (channelRef) {
    return channelRef;
  }

  if (!env.RABBITMQ_URL) {
    return null;
  }

  const conn = (await connect(env.RABBITMQ_URL)) as unknown as ManageConnection;

  connectionRef = conn;

  conn.on('close', () => {
    logger.warn('RMQ connection closed');
    connectionRef = null;
    channelRef = null;
  });

  conn.on('error', (error) => {
    logger.error({ error }, 'RMQ connection error');
  });
  const ch = await conn.createChannel();
  channelRef = ch;

  await ch.assertExchange(USER_EVENT_EXCHANGE, 'topic', { durable: true });

  return ch;
};

export const initPublisher = async () => {
  if (!messagingEnabled) {
    logger.info('RMQ URL is not configured');
    return;
  }

  await ensureChannel();

  logger.info('User service RMQ publisher initialized');
};

export const closePublisher = async () => {
  try {
    if (channelRef) {
      const currentChannel: Channel = channelRef;
      channelRef = null;
      await currentChannel.close();
    }
    if (connectionRef) {
      const currentConnection: ManageConnection = connectionRef;
      connectionRef = null;
      await currentConnection.close();
    }
  } catch (error) {
    logger.error({ err: error }, 'Error closing RMQ connection/channel');
  }
};

export const publishUserCreatedEvent = async (payload: UserCreatedPayload) => {
  const ch = await ensureChannel();

  if (!ch) {
    logger.debug({ payload }, 'Skipping user.created event publish because messaging disabled');
  }

  const event: UserCreatedEvent = {
    type: USER_CREATED_ROUTING_KEY,
    payload,
    occurredAt: new Date(),
    metadata: { version: 1 },
  };

  try {
    const success = ch?.publish(
      USER_EVENT_EXCHANGE,
      USER_CREATED_ROUTING_KEY,
      Buffer.from(JSON.stringify(event)),
      { contentType: 'application/json', persistent: true },
    );

    if (!success) {
      logger.warn({ event }, 'Failed to publish user.created event');
    }
  } catch (error) {
    logger.error({ err: error }, 'Error publishing user.created event');
  }
};
