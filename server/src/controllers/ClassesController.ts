import { Request, Response } from 'express';
import db from '../db/connections';
import convertHoursToMinutes from '../utils/converHoursToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

export default class ClassesController {
    async index(rq: Request, rsp: Response) {
        //let initialSeconds = Date.now();
        const filters = rq.query;
        const [count] = await db('classes').count(); 
        const { page = 1 } = rq.query; 
        const limit = 10;
        const offset = (Number(page) - 1) * limit;

        if (offset < 0) {
            return rsp.json([]);
        }
        if (filters.user_id) {
            
            const classes_items = (await db('classes')
                .join('users', 'classes.user_id', '=', 'users.id')
                .join('profile', 'classes.user_id', '=', 'profile.user_id')
                .orderBy('id', 'desc').limit(limit).offset(offset)
                .where('classes.user_id', '=', Number(filters.user_id))
                .select('classes.*', 'users.name', 'users.id as user_id', 'profile.avatar', 'profile.whatsapp', 'profile.bio')).reverse();

            let [total] = await db('classes').where('classes.user_id', '=', Number(filters.user_id)).count();

            for (let i = 0; i < classes_items.length; i++) {
                const scheduled_items = await db('class_schedule').where('class_id', '=', classes_items[i].id).select('class_schedule.class_id', 'class_schedule.from', 'class_schedule.to', 'class_schedule.week_day');
                if (scheduled_items != undefined) {
                    classes_items[i].schedule = scheduled_items
                }
            }
			rsp.header('X-Total-Count', String(total['count(*)']));
            //console.log(`Responded in ${Date.now()-initialSeconds}ms!`);
            return rsp.json(classes_items);
        }
        if (!filters.subject || !filters.week_day || !filters.time) {
            const classes_items = await db('classes')
                .join('users', 'classes.user_id', '=', 'users.id')
                .join('profile', 'classes.user_id', '=', 'profile.user_id')
                .orderBy('id', 'desc').limit(limit).offset(offset)
                .select('classes.*', 'users.name', 'users.id as user_id', 'profile.avatar', 'profile.whatsapp', 'profile.bio');
            
            for (let i = 0; i < classes_items.length; i++) {
                // I GOT A BETTER SOLUTION SUCKEEEEEERS

                const scheduled_items = await db('class_schedule').where('class_id', '=', classes_items[i].id).select('class_schedule.class_id', 'class_schedule.from', 'class_schedule.to', 'class_schedule.week_day');
                if (scheduled_items != undefined) {
                    classes_items[i].schedule = scheduled_items
                }
            }

			rsp.header('X-Total-Count', String(count['count(*)']));
            //console.log(`Responded in ${Date.now()-initialSeconds}ms!`);
            return rsp.json(classes_items);
        }
        const timeInMinutes = convertHoursToMinutes(filters.time as string);
		
		const totalDefault = await db('classes')
            .whereExists(function () {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(filters.week_day as string)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', filters.subject as string)
            .join('users', 'classes.user_id', '=', 'users.id')
            .join('profile', 'classes.user_id', '=', 'profile.user_id')
            .count('* as total');
		rsp.header('X-Total-Count', String(totalDefault[0].total));

        const classes = await db('classes')
            .whereExists(function () {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(filters.week_day as string)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', filters.subject as string)
            .join('users', 'classes.user_id', '=', 'users.id')
            .join('profile', 'classes.user_id', '=', 'profile.user_id')
            .orderBy('id', 'desc').limit(limit).offset(offset)
            .select('classes.*', 'users.name', 'users.id as user_id', 'profile.avatar', 'profile.whatsapp', 'profile.bio');

        // made a better algorithm :)

        for (let i = 0; i < classes.length; i++) {
            const scheduled_items = await db('class_schedule').where('class_id', '=', classes[i].id);
            if (scheduled_items != undefined) {
                classes[i].schedule = scheduled_items
            }
        }
        //console.log(`Responded in ${Date.now()-initialSeconds}ms!`);
        return rsp.json(classes);
    }

    async create(rq: Request, rsp: Response) {
        const { subject, cost, schedule } = rq.body;
        const trx = await db.transaction();

        try {
            const user_id = rq.userId;

            const insertedClassId = await trx('classes').insert({
                subject,
                cost,
                user_id
            });

            const class_id = insertedClassId[0];
            //console.log(class_id);

            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id,
                    week_day: scheduleItem.week_day,
                    from: convertHoursToMinutes(scheduleItem.from),
                    to: convertHoursToMinutes(scheduleItem.to),
                }
            });

            await trx('class_schedule').insert(classSchedule);

            await trx.commit();

            return rsp.status(201).send();
        } catch (err) {
            await trx.rollback();
            console.error(err);
            return rsp.status(400).json({
                message: err
            });
        }
    }

    async delete(rq: Request, rsp: Response) {
        const { id } = rq.params;

        if (!id)
            return rsp.status(400).send({ message: 'Id not provided' });

        const classes = await db('classes').where('id', '=', id);

        if (classes.length == 0)
            return rsp.status(400).send({ message: 'Invalid Id' });

        if (classes[0].user_id != rq.userId)
            return rsp.status(400).send({ message: 'Unauthorized' });

        const trx = await db.transaction();

        await trx('classes').where('id', '=', id).delete();

        await trx.commit();

        return rsp.send({ message: 'Class deleted.' })
    }

    async edit(rq: Request, rsp: Response) {
        const { id } = rq.params;
        const { subject, cost, schedule } = rq.body;

        if (!id)
            return rsp.status(400).send({ message: 'Id not provided' });

        const classes = await db('classes').where('id', '=', id);

        if (classes.length == 0)
            return rsp.status(400).send({ message: 'Invalid Id' });

        if (classes[0].user_id != rq.userId)
            return rsp.status(400).send({ message: 'Unauthorized' });

        const trx = await db.transaction();

        try {
            await trx('classes').where('id', '=', id).update({
                subject,
                cost,
                user_id: rq.userId
            });

            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    class_id: id,
                    week_day: scheduleItem.week_day,
                    from: convertHoursToMinutes(scheduleItem.from),
                    to: convertHoursToMinutes(scheduleItem.to),
                }
            });

            await trx('class_schedule').where('class_schedule.class_id', '=', id).delete();
            await trx('class_schedule').insert(classSchedule);

            await trx.commit();

            return rsp.status(201).send();
        } catch (err) {
            await trx.rollback();
            console.error(err);
            return rsp.status(400).json({
                message: err
            });
        }
    }

    async total(rq: Request, rsp: Response) {
        const totalClasses = await db('classes').count('* as total');

        const { total } = totalClasses[0];

        return rsp.json({ total });
    }

    async total_from_user(rq: Request, rsp: Response) {
        const { user_id } = rq.params;
        
        const totalClasses = await db('classes').where('user_id', '=', user_id).count('* as total');

        const { total } = totalClasses[0];

        return rsp.json({ total });
    }

    async index_one(rq: Request, rsp: Response) {
        const { id } = rq.params;

        const classes = await db('classes')
        .join('users', 'classes.user_id', '=', 'users.id')
        .join('profile', 'classes.user_id', '=', 'profile.user_id')
        .where('classes.id', '=', Number(id))
        .select('classes.*', 'users.name', 'users.id as user_id', 'profile.avatar', 'profile.whatsapp', 'profile.bio');

        const scheduled_items = await db('class_schedule').where('class_id', '=', classes[0].id);
        if (scheduled_items != undefined) {
            classes[0].schedule = scheduled_items
        }

        console.log(classes);

        if (classes.length == 0)
            return rsp.status(400).send({ message: 'Invalid Id' });

        return rsp.json(classes);
    }
}