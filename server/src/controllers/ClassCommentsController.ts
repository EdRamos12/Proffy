import { Request, Response } from 'express';
import db from '../db/connections';

export default class ClassCommentsController {
    async create(rq: Request, rsp: Response) {
        const { content } = rq.body;
        const { class_id } = rq.params;
        const trx = await db.transaction();

        try {
            const user_id = rq.userId;

            const insertedClassComment = await trx('class_comment').insert({
                content,
                class_id,
                user_id 
            });
            console.log(insertedClassComment);
            await trx.commit();

            return rsp.status(201).send();
        } catch (err) {
            return rsp.status(500).send();
        }
    }

    async index(rq: Request, rsp: Response) {
        const { class_id } = rq.params;
        
        const post = await db('classes').where('id', '=', class_id);

        if (post.length == 0) return rsp.status(400).send({ message: 'Invalid Id' });

        const comments_post = await db('class_comment').where('class_id', '=', class_id);

        if (comments_post.length == 0) return rsp.status(404).send({ message: 'No comments found' });

        return rsp.json(comments_post);
    }

    async delete(rq: Request, rsp: Response) {
        const { class_id, id } = rq.params;
        
        const post = await db('classes').where('id', '=', class_id);

        if (post.length == 0) return rsp.status(400).send({ message: 'Invalid Id' });

        const comments_post = await db('class_comment').where('id', '=', id);

        if (comments_post.length == 0) return rsp.status(404).send({ message: 'No comments found' });

        const user_id = rq.userId;
        console.log(user_id);
        //console.log(post, comments_post)

        if (user_id !== post[0].user_id || user_id !== comments_post[0].user_id) return rsp.status(400).send({ message: 'Unauthorized' });

        const trx = await db.transaction();

        await trx('class_comment').where('id', '=', id).delete();

        await trx.commit();

        return rsp.send({ message: 'Comment deleted.' })
    }
}