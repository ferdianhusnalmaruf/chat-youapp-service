import { env } from '@/config/env';
import { userService } from '@/services/user.service';
import { logger } from '@/utils/logger';
import {
  AUTH_EVENT_EXCHANGE,
  AUTH_USER_REGISTERED_ROUTING_KEY,
  AuthRegisteredEvent,
} from '@chat-youapp/common';
import { Channel, ChannelModel, connect, ConsumeMessage, Replies, type Connection } from 'amqplib';

type ManageConnection = Connection & ChannelModel;

let connectionRef: ManageConnection | null = null;
let channel: Channel | null = null;
let consumerTag: string | null = null;

const QUEUE_NAME = 'auth-service.auth-events';

const closeConnection = async (con: ManageConnection) => {
  await con.close();
  connectionRef = null;
  channel = null;
  consumerTag = null;
};

const handleMessage = async (message: ConsumeMessage, channel: Channel) => {
  const raw = message.content.toString('utf-8');
  const event = JSON.parse(raw) as AuthRegisteredEvent;

  await userService.syncFromAuthUser(event.payload);

  channel.ack(message);
};

export const startAuthEventConsumer = async () => {
  if (!env.RABBITMQ_URL) {
    logger.warn('RMQ Url is not configured');
    return;
  }

  if (channel) {
    return;
  }
  const con = (await connect(env.RABBITMQ_URL)) as ManageConnection;
  connectionRef = con;
  const chan = await con.createChannel();
  channel = chan;

  await chan.assertExchange(AUTH_EVENT_EXCHANGE, 'topic', { durable: true });
  const queue = await chan.assertQueue(QUEUE_NAME, { durable: false });
  await chan.bindQueue(queue.queue, AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTERED_ROUTING_KEY);

  const consumerHandler = (message: ConsumeMessage | null) => {
    if (!message) {
      return;
    }

    void handleMessage(message, chan).catch((err: unknown) => {
      logger.info({ err }, 'Failed to process auth event');
      chan.nack(message, false, false);
    });
  };

  const result: Replies.Consume = await chan.consume(queue.queue, consumerHandler);
  consumerTag = result.consumerTag;

  con.on('close', () => {
    logger.warn('Auth consumer connection closed');
    connectionRef = null;
    consumerTag = null;
    channel = null;
  });

  con.on('error', (err) => {
    logger.error({ err }, 'Auth consumer connection error');
    connectionRef = null;
    consumerTag = null;
    channel = null;
  });

  logger.info('AUTH EVENT consumer running');
};

export const stopAuthEventConsumer = async () => {
  try {
    const ch = channel;
    if (ch && consumerTag) {
      await ch.cancel(consumerTag);
      consumerTag = null;
    }

    if (ch) {
      await ch.close();
      channel = null;
    }

    const conn = connectionRef;

    if (conn) {
      await closeConnection(conn);
      connectionRef = null;
    }
  } catch (error) {
    logger.error({ error }, 'Failed to stop auth event consumer');
  }
};
