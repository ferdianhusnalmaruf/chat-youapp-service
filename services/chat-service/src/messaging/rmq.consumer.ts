import { type ChannelModel, type Channel, connect, ConsumeMessage, Replies } from 'amqplib';

import {
  USER_EVENT_EXCHANGE,
  USER_CREATED_ROUTING_KEY,
  type UserCreatedEvent,
} from '@chat-youapp/common';
import { logger } from '../utils/logger';
import { userRepository } from '@/repositories/user.repository';
import { env } from '@/config/env';
import { log } from 'console';

let connectionRef: ChannelModel | null = null;
let channelRef: Channel | null = null;
let consumerTag: string | null = null;

const EVENT_QUEUE = 'chat-service.user-events';

const closedConnection = async (con: ChannelModel) => {
  await con.close();
};

const handleUserCreated = async (event: UserCreatedEvent) => {
  await userRepository.upsertUser(event.payload);
};

export const startUserEventConsumer = async () => {
  if (!env.RABBITMQ_URL) {
    logger.warn('RMQ Url is not configured');
    return;
  }

  const conn = (await connect(env.RABBITMQ_URL)) as ChannelModel;
  connectionRef = conn;
  const ch = await conn.createChannel();
  channelRef = ch;

  await ch.assertExchange(USER_EVENT_EXCHANGE, 'topic', { durable: true });
  const q = await ch.assertQueue(EVENT_QUEUE, { durable: true });
  await ch.bindQueue(q.queue, USER_EVENT_EXCHANGE, USER_CREATED_ROUTING_KEY);

  const consumerHandler = async (message: ConsumeMessage | null) => {
    if (!message) {
      return;
    }

    void (async () => {
      const payload = message.content.toString('utf-8');
      const event = JSON.parse(payload) as UserCreatedEvent;
      await handleUserCreated(event);
      ch?.ack(message);
    })().catch((error) => {
      logger.error({ error }, 'Error handling user created event');
      ch?.nack(message, false, false);
    });
  };

  const result: Replies.Consume = await ch.consume(q.queue, consumerHandler);
  consumerTag = result.consumerTag;
  logger.info('RMQ started user event consumer');
};

export const closeUserEventConnection = async () => {
  try {
    const ch = channelRef;
    if (ch && consumerTag) {
      await ch.cancel(consumerTag);
      consumerTag = null;
    }
    if (ch) {
      await ch.close();
      channelRef = null;
    }
    const conn = connectionRef;
    if (conn) {
      await closedConnection(conn);
      connectionRef = null;
    }
  } catch (error) {
    logger.error({ err: error }, 'Error stopping RabbitMQ consumer');
  }
};
