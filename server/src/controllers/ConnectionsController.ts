import { Request, Response } from 'express';
import db from '../db/connections';

export default class ConnectionsController {
    async index(rq: Request, rsp: Response) {
        const totalConnections = await db('connections').count('* as total');

        const { total } = totalConnections[0];

        return rsp.json({ total })
    }
    async create(rq: Request, rsp: Response) {
        const {user_id} = rq.body;

        if (rq.userId == user_id) {
            console.log('bruh');
            return rsp.status(401).send({ message: 'You cannot create connections on your own class!' });
        }

        await db('connections').insert({
            user_id
        });

        return rsp.status(201).send();
    }
}