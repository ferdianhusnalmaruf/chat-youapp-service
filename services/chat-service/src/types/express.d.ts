import { AuthenticationUser } from '@chat-youapp/common';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticationUser;
    }
  }
}

export {};
