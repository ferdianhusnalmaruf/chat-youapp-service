import { EventPayload, OutboundEvent } from './event-types';

export const USER_EVENT_EXCHANGE = 'user.events';
export const USER_CREATED_ROUTING_KEY = 'user.created';

export interface UserCreatedPayload extends EventPayload {
  id: string;
  email: string;
  username: string;
  birthday?: string;
  height?: number;
  weight?: number;
  interests?: string[];
  createdAt: string;
  updatedAt: string;
}

export type UserCreatedEvent = OutboundEvent<typeof USER_CREATED_ROUTING_KEY, UserCreatedPayload>;
