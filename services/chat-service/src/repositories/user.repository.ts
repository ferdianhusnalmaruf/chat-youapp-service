import type { UserCreatedPayload } from '@chat-youapp/common';
import type { Collection } from 'mongodb';

import { getMongoClient } from '@/clients/mongo.client';

const COLLECTION_NAME = 'users';

const getCollection = async (): Promise<Collection<UserDocument>> => {
  const client = await getMongoClient();
  return client.db().collection<UserDocument>(COLLECTION_NAME);
};

interface UserDocument {
  _id: string;
  email: string;
  username: string;
  birthday?: string;
  height?: number;
  weight?: number;
  interests?: string[];
  createdAt: string;
  updatedAt: string;
}

export const userRepository = {
  async upsertUser(payload: UserCreatedPayload) {
    const collection = await getCollection();
    await collection.updateOne(
      { _id: payload.id },
      {
        $set: {
          email: payload.email,
          username: payload.username,
          birthday: payload.birthday,
          height: payload.height,
          weight: payload.weight,
          interests: payload.interests,
          updatedAt: payload.updatedAt,
        },
        $setOnInsert: {
          createdAt: payload.createdAt,
        },
      },
      { upsert: true },
    );
  },

  async findUserById(id: string): Promise<UserDocument | null> {
    const collection = await getCollection();
    return collection.findOne({ _id: id });
  },
};
