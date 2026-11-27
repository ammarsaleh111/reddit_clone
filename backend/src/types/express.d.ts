
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: "user";
      };
    }
  }
}

export {};
