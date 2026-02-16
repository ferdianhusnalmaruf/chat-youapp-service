export interface User {
  id: string;
  email: string;
  username: string;
  birthday?: Date;
  height?: number;
  weight?: number;
  interests?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  username: string;
  birthday?: Date;
  height?: number;
  weight?: number;
  interests?: string[];
}
