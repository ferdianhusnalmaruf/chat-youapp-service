import { ObjectId } from 'mongodb';
import type { WithId, Document } from 'mongodb';
import { getMongoClient } from '@/clients/mongo.client';
import type {
  Conversation,
  ConversationFilter,
  ConversationSummary,
  CreateConversationInput,
} from '@/types/conversation';
import { randomUUID } from 'node:crypto';

const CONVERSATION_COLLECTION = 'conversations';
const MESSAGE_COLLECTION = 'messages';

const toConversation = (doc: WithId<Document>): Conversation => ({
  id: doc._id.toString(),
  title: typeof doc.title === 'string' ? doc.title : null,
  participantIds: Array.isArray(doc.participantIds) ? (doc.participantIds as string[]) : [],
  createdAt: new Date(doc.createdAt as string | number | Date),
  updatedAt: new Date(doc.updatedAt as string | number | Date),
  lastMessageAt: doc.lastMessageAt ? new Date(doc.lastMessageAt as string | Date) : null,
  lastMessagePreview: typeof doc.lastMessagePreview === 'string' ? doc.lastMessagePreview : null,
});

const toConversationSummary = (doc: WithId<Document>): ConversationSummary => toConversation(doc);

export const conversationRepository = {
  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const client = await getMongoClient();
    const collection = client.db().collection(CONVERSATION_COLLECTION);
    const now = new Date();
    const document = {
      _id: randomUUID(),
      title: input.title || null,
      participantIds: input.participantIds,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: null,
      lastMessagePreview: null,
    };

    await collection.insertOne(document as unknown as Document);
    return toConversation(document as unknown as WithId<Document>);
  },

  async findById(id: string): Promise<Conversation | null> {
    const client = await getMongoClient();
    const collection = client.db().collection(CONVERSATION_COLLECTION);
    const doc = await collection.findOne({ _id: id as unknown as ObjectId });
    return doc ? toConversation(doc) : null;
  },

  async findSummaries(filter: ConversationFilter): Promise<ConversationSummary[]> {
    const client = await getMongoClient();
    const collection = client.db().collection(CONVERSATION_COLLECTION);

    const match = filter.participantId ? { participantIds: { $in: [filter.participantId] } } : {};

    const results = await collection
      .find(match)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .toArray();

    return results.map(toConversationSummary);
  },

  async lastSeenConversation(conversationId: string, userId: string): Promise<void> {
    const client = await getMongoClient();
    const collection = client.db().collection(CONVERSATION_COLLECTION);
    await collection.updateOne(
      { _id: conversationId as unknown as ObjectId },
      {
        $set: {
          lastMessageAt: new Date(),
          lastMessagePreview: userId,
          updatedAt: new Date(),
        },
      },
    );
  },

  async removeAll(): Promise<void> {
    const client = await getMongoClient();
    const db = client.db();

    await Promise.all([
      db.collection(CONVERSATION_COLLECTION).deleteMany({}),
      db.collection(MESSAGE_COLLECTION).deleteMany({}),
    ]);
  },
};
