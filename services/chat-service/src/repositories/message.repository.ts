import { getMongoClient } from '@/clients/mongo.client';
import { Message, MessageListOptions } from '@/types/message';
import { WithId, Document, ObjectId } from 'mongodb';
import { randomUUID } from 'node:crypto';

const MESSAGE_COLLECTION = 'messages';

const toMessage = (doc: WithId<Document>): Message => ({
  id: String(doc._id),
  conversationId: String(doc.conversationId),
  senderId: String(doc.senderId),
  body: String(doc.body),
  createdAt: new Date(doc.createdAt as string | number | Date),
  reactions: Array.isArray(doc.reactions)
    ? doc.reactions.map((r: WithId<Document>) => ({
        emoji: String(r.emoji),
        userId: String(r.userId),
        createdAt: new Date(r.createdAt as string | number | Date),
      }))
    : [],
});

export const messageRepository = {
  async createMessage(conversationId: string, senderId: string, body: string): Promise<Message> {
    const client = await getMongoClient();
    const collection = client.db().collection(MESSAGE_COLLECTION);
    const now = new Date();
    const document = {
      _id: randomUUID(),
      conversationId,
      senderId,
      body,
      createdAt: now,
    };
    await collection.insertOne(document as unknown as Document);
    return toMessage(document as unknown as WithId<Document>);
  },

  async findByConversationId(
    conversationId: string,
    options: MessageListOptions = {},
  ): Promise<Message[]> {
    const query: Record<string, unknown> = {
      conversationId,
    };

    if (options.after) {
      query.createdAt = { $gt: options.after };
    }

    const client = await getMongoClient();
    const collection = client.db().collection(MESSAGE_COLLECTION);
    const cursor = collection
      .find(query)
      .sort({ createdAt: 1 })
      .limit(options.limit || 50);

    const documents = await cursor.toArray();
    return documents.map(toMessage);
  },

  async findById(messageId: string): Promise<Message | null> {
    const client = await getMongoClient();
    const doc = await client
      .db()
      .collection(MESSAGE_COLLECTION)
      .findOne({ _id: new ObjectId(messageId) } as unknown as Document);
    return doc ? toMessage(doc) : null;
  },
};
