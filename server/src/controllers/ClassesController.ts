import { Request, Response } from 'express';
import db from '../db/connections';
import convertHoursToMinutes from '../utils/converHoursToMinutes';

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

function groupBy(list: any, keyGetter: any) {
    const map = new Map();
    list.forEach((item: any) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

export default class ClassesController {
    async index(rq: Request, rsp: Response) {
        const filters = rq.query;
		//console.log(filters);
        const [count] = await db('classes').count(); 
        const { page = 1 } = rq.query; 

        let { total } = (await db('classes').count('* as total'))[0]; 
        let index = Number(total) - (Number(total) % 5); 
        let offset = (Number(index) - ((Number(page) - 1) * 5));

        if (offset < 0) {
            return rsp.json([]);
        }
        //console.log(filters.user_id);
        if (filters.user_id) {
            const { total } = (await db('classes').where('classes.user_id', '=', String(filters.user_id)).count('* as total'))[0]; 
            const index = Number(total) - (Number(total) % 5); 
            let offset = (Number(index) - ((Number(page) - 1) * 5));
            if ((offset % 10 == 0 || offset % 5 == 0 || (offset - 1) % 5 == 0) && offset !== 0) offset -= 5;
            
            const classes_items = (await db('classes')
                .join('users', 'classes.user_id', '=', 'users.id')
                .join('profile', 'classes.user_id', '=', 'profile.user_id')
                .limit(5).offset(offset)
                .where('classes.user_id', '=', Number(filters.user_id))
                .select('classes.*', 'users.name', 'users.id as user_id', 'profile.avatar', 'profile.whatsapp', 'profile.bio')).reverse();

            const schedule = (await db('class_schedule')
                .select('class_schedule.class_id', 'class_schedule.from', 'class_schedule.to', 'class_schedule.week_day')).reverse();

            const grouped = groupBy(schedule, (item: { class_id: string; }) => item.class_id);

            for (let i = 0; i < classes_items.length; i++) {
                const items = grouped.get(classes_items[i].id);
                let cancelEarly = 0;

                if (items != undefined) {
                    classes_items[i] = {
                        ...classes_items[i],
                        schedule: items,
                    }
                    cancelEarly++;
                }
                if (cancelEarly == 5) {
                    break;
                }
            }
			rsp.header('X-Total-Count', String(count['count(*)']));
            return rsp.json(classes_items);
        }
        if (!filters.subject || !filters.week_day || !filters.time) {
            if (offset % 5 == 0) {
                offset -= 5;
            }
            console.log(String(offset)[String(offset).length - 1]);

            const classes_items = (await db('classes')
                .join('users', 'classes.user_id', '=', 'users.id')
                .join('profile', 'classes.user_id', '=', 'profile.user_id')
                .limit(5).offset(offset).select('classes.*', 'users.name', 'users.id as user_id', 'profile.avatar', 'profile.whatsapp', 'profile.bio')).reverse();

            const schedule = (await db('class_schedule')
                .select('class_schedule.class_id', 'class_schedule.from', 'class_schedule.to', 'class_schedule.week_day')).reverse();

            const grouped = groupBy(schedule, (item: { class_id: string; }) => item.class_id);

            for (let i = 0; i < classes_items.length; i++) {
                const items = grouped.get(classes_items[i].id);
                let cancelEarly = 0;

                if (items != undefined) {
                    classes_items[i] = {
                        ...classes_items[i],
                        schedule: items,
                    }
                    cancelEarly++;
                }
                if (cancelEarly == 5) {
                    break;
                }
            }
			rsp.header('X-Total-Count', String(count['count(*)']));
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
		index = Number(totalDefault[0].total) - (Number(totalDefault[0].total) % 5);
        offset = (Number(index) - ((Number(page) - 1) * 5));
        if (offset < 0) {
            return rsp.json([]);
        }

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
            .limit(5).offset(offset)
            .select('classes.*', 'users.name', 'users.id as user_id', 'profile.avatar', 'profile.whatsapp', 'profile.bio');

        // this is the only way i could return the table like this, don't blame me
        // if you could improve it, please contact me ;-ç;
        // this algorithm sucksssssssss

        const schedule = await db('classes')
            .whereExists(function () {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(filters.week_day as string)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', filters.subject as string)
            .join('class_schedule', 'classes.id', '=', 'class_schedule.class_id')
            .select('class_schedule.*');

        const grouped = groupBy(schedule, (item: { class_id: string; }) => item.class_id);

        for (let i = 0; i < classes.length; i++) {
            //console.log(i);
            let items = grouped.get(classes[i].id);

            if (items != undefined) {
                classes[i] = {
                    ...classes[i],
                    schedule: items,
                }
            }
        }

        return rsp.json(classes.reverse())
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

        const classes = await await db('classes')
        .join('users', 'classes.user_id', '=', 'users.id')
        .join('profile', 'classes.user_id', '=', 'profile.user_id')
        .where('classes.id', '=', Number(id))
        .select('classes.*', 'users.name', 'users.id as user_id', 'profile.avatar', 'profile.whatsapp', 'profile.bio');

        if (classes.length == 0)
            return rsp.status(400).send({ message: 'Invalid Id' });

        return rsp.json(classes);
    }
}