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

export interface CreatedUserInput {
  email: string;
  username: string;
}
