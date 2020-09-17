import { Request, Response } from 'express';
import knex from '../db/connections';

export default class ProfileController {
    async edit(rq: Request, rsp: Response) {
        const { whatsapp, bio, name } = rq.body;


        const trx = await knex.transaction();
        try {
            let profile;
            if (rq.file !== undefined) {
                profile = await trx('profile').where('user_id', '=', rq.userId).update({
                    whatsapp,
                    bio,
                    avatar: 'http://localhost:3333/uploads/'+rq.file.filename,
                });
            } else {
                profile = await trx('profile').where('user_id', '=', rq.userId).update({
                    whatsapp,
                    bio,
                });
            }
			await trx('users').where('id', '=', rq.userId).update({
				name
			});

            await trx.commit();

            return rsp.send({ profile });
        } catch (err) {
            await trx.commit();
            return rsp.status(400).send({ message: err });
        }
    }
}