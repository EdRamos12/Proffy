declare module '*.json';

declare namespace Express {
    interface Request {
        customProperties: string[];
        userId: number;
    }
}