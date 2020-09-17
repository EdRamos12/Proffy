import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function authMiddleware (rq: Request, rsp: Response, next: NextFunction) {
    const authHeader = rq.cookies.__bruh;
    if (!authHeader) return rsp.status(401).send({ message: 'No token provided' });

    const parts = authHeader.split(' ');
    if (parts.length != 2) return rsp.status(401).send({ message: 'Token error' });

    const [scheme, token] = parts;
    if (!/^Proff$/i.test(scheme)) return rsp.status(401).send({ message: 'Error while formatting the token' });

    jwt.verify(token, String(process.env.JWT_AUTH), (error: any, decoded: any) => {
        if (error) return rsp.status(401).send({ error });

        rq.userId = decoded.id;
        return next();
    });
}