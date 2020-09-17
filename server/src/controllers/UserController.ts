import { Request, Response, NextFunction } from 'express';
import db from '../db/connections';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createTransport } from 'nodemailer';
import nodeMailerConfig from '../config/nodemailer.json';
require('dotenv/config');

async function sendMail(to: string, subject: string, content: string, text: string) {
    const transporter = createTransport({
        ...nodeMailerConfig,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const emailHTML = `
        <div style="margin:0px auto; max-width:640px; background:#8257E5">
            <a href="http://localhost:3000" target="_blank" style="text-align: center">
                <img width="640" src="https://i.imgur.com/tVuGWLt.png" style="z-index: 0;" />
            </a>
            <div style="text-align:center; vertical-align:top; padding:40px 70px; background:#8257E5; display: flex;">
                <div style="background: white; padding: 32px; z-index: 1; border-radius: 8px; font-family: Poppins; font-style: normal; font-weight: normal; font-size: 16px; line-height: 26px; color: #6A6180; font-family: tahoma, serif; font-size: 20px;">
                    ${content}
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Proffy 💜" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
        html: emailHTML
    };

    const info = await transporter.sendMail(mailOptions);
    return info.messageId;
}


export default class UserController {
    async create(rq: Request, rsp: Response) {
        try {
            let { name, email, password } = rq.body;
            let avatar;

            if (rq.file === undefined) {
                avatar = 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.stack.imgur.com%2F34AD2.jpg?'
            } else {
                avatar = 'http://localhost:3333/uploads/' + rq.file.filename;
            }

            const registered = await db('users').where('email', '=', email);

            if (registered.length != 0 && registered[0].confirmed) {
                return rsp.status(400).send({ message: 'Email already in use' });
            }

            const trx = await db.transaction();
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            if (registered.length != 0 && !registered[0].confirmed) {

                await trx('users').where('id', '=', registered[0].id).update({ name, email, password: hashedPassword });
                await trx('profile').where('user_id', '=', registered[0].id).update({ avatar });

                await trx.commit();

                const token = jwt.sign({ id: registered[0].id }, String(process.env.JWT_REGISTER), {
                    expiresIn: 86400,
                })

                const link = `http://localhost:3000/confirm/${token}`;

                const content = `
                    <p>Thank you for registering an account for Proffy 💜! Before entering your account, we need to confirm if it's really you! Click below to verify your e-mail</p>
                    <p>This link is valid for 24 hours, once it expires, you can register again to receive this e-mail again.</p>
                    <a href=${link} target="_blank" style="margin-top: 20px; display: block; text-decoration: none; border: none; background: #916BEA; padding: 3%; border-radius: 0.8rem; color: white; padding: 15px 30px;">Verify!</a>
                `

                sendMail(email, 'E-mail verification from Proffy', content, `Thank you for registering an account for Proffy 💜! Before entering your account, we need to confirm if it's really you! Click below to verify your e-mail ${link}`);
                return rsp.status(202).send({ id: registered[0].id });
            }

            const user = await trx('users').insert({
                name, email, password: hashedPassword
            });
            await trx('profile').insert({
                avatar,
                user_id: user[0]
            });

            await trx.commit();

            const token = jwt.sign({ id: user[0] }, String(process.env.JWT_REGISTER), {
                expiresIn: '24h',
            })

            const link = `http://localhost:3000/confirm/${token}`;

            const content = `
                <p>Thank you for registering an account for Proffy 💜! Before entering your account, we need to confirm if it's really you! Click below to verify your e-mail</p>
                <p>This link is valid for 24 hours, once it expires, you can register again to receive this e-mail again.</p>
                <a href=${link} target="_blank" style="margin-top: 20px; display: block; text-decoration: none; border: none; background: #916BEA; border-radius: 0.8rem; color: white; padding: 15px 30px;">Verify!</a>
            `

            sendMail(email, 'E-mail verification from Proffy', content, `Thank you for registering an account for Proffy 💜! Before entering your account, we need to confirm if it's really you! Click below to verify your e-mail ${link}`);
            return rsp.status(201).send({ id: user[0] });
        } catch (error) {
            console.log(error)
            rsp.status(500).send({ message: error });
        }
    }

    async confirm(rq: Request, rsp: Response, next: NextFunction) {
        const { token } = rq.params;

        if (!token)
            return rsp.status(401).send({ message: 'No token provided' });

        jwt.verify(token, String(process.env.JWT_REGISTER), async (err: any, decoded: any) => {
            if (err) return rsp.status(401).send({ message: 'Invalid token' });

            const trx = await db.transaction();
            await trx('users').where('id', '=', decoded.id).update({ confirmed: true });
            await trx.commit();
        });

        return rsp.status(202).send({ message: 'E-mail confirmed. You can now log in.' });
    }

    async forgot(rq: Request, rsp: Response) {
        const { email } = rq.body;

        const user = await db('users').where('email', '=', email);

        if (user.length == 0)
            return rsp.status(400).send({ message: 'E-mail not found' });

        const token = jwt.sign({ email: user[0].email }, String(process.env.JWT_REGISTER), {
            expiresIn: '1h',
        });

        const appLink = 'http://localhost:3000/reset-password/'

        const content = `
            <p>Are you trying to access into your account and forgot your password? If so, here is the link to reset it, its only valid for <b>1 hour</b>:<br> <a target="_blank" href=${appLink+token} style="margin: 20px 0; display: block; text-decoration: none; border: none; background: #916BEA; border-radius: 0.8rem; color: white; padding: 15px 30px;">Reset my password!</a></p>
            <p>If you are not trying to reset your password, just ignore it.</p>
        `

        sendMail(email, 'Forgot your password?', content, `Are you trying to access into your account and forgot your password? If so, here is the link to reset it, its only valid for 1 hour: ${appLink+token}`);

        console.log(token)
        return rsp.status(200).send({ message: 'E-mail sent.' });
    }

    async reset(rq: Request, rsp: Response) {
        const { password, token } = rq.body;

        jwt.verify(token, String(process.env.JWT_REGISTER), async (err: any, decoded: any) => {
            if (err) return rsp.status(401).send({ message: 'Invalid token' });

            const currentPass = await db('users').where('email', '=', decoded.email).select('users.password');
            const passwordCompare = await bcrypt.compare(password, currentPass[0].password);

            if (passwordCompare) {
                return rsp.status(401).send({ message: 'Make sure to use a different password!' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const trx = await db.transaction();
            await trx('users').where('email', '=', decoded.email).update({ password: hashedPassword });
            await trx.commit();

            return rsp.status(200).send({ message: 'Password reset went successfully.' })
        });
    }

    async authenticate(rq: Request, rsp: Response) {
        const { email, password, remember_me } = rq.body;

        const user = await db('users').where('email', '=', email);

        if (user.length == 0)
            return rsp.status(400).send({ message: 'Login failed' }) // email

        const passwordCompare = await bcrypt.compare(password, user[0].password);

        if (!passwordCompare)
            return rsp.status(400).send({ message: 'Login failed' }) // password

        if (!user[0].confirmed)
            return rsp.status(400).send({ message: 'You must confirm your e-mail.' }) // email not confirmed

        let accessToken = 'Proff ';
        if (remember_me) {
            accessToken += jwt.sign({ id: user[0].id }, String(process.env.JWT_AUTH), {
                expiresIn: '7d',
            });
        } else {
            accessToken += jwt.sign({ id: user[0].id }, String(process.env.JWT_AUTH), {
                expiresIn: '12h',
            });
        }

        const info = await db('users')
            .join('profile', 'users.id', 'profile.user_id')
            .select(['users.*', 'profile.*'])
            .where({ user_id: user[0].id });
		
		const totalConnections = await db('connections').where('user_id', '=', user[0].id).count('* as total');

        info[0] = {
            ...info[0],
            password: undefined,
            user_id: undefined,
            confirmed: undefined,
			total_connections: totalConnections[0].total
        }

        rsp.cookie('__bruh', accessToken, {
            httpOnly: true
        })

        return rsp.status(202).send(info[0]);
    }

    async verify(rq: Request, rsp: Response) {
        const user = await db('users')
            .join('profile', 'users.id', 'profile.user_id')
            .select(['users.*', 'profile.*'])
            .where({ user_id: rq.userId });

        if (user.length == 0) {
            return rsp.status(400).send({ message: 'Invalid Id' })
        }
		
		const totalConnections = await db('connections').where('user_id', '=', rq.userId).count('* as total');

        user[0] = {
            ...user[0],
            password: undefined,
            user_id: undefined,
			total_connections: totalConnections[0].total
        }

        return rsp.status(200).send({ ...user[0] });
    }

    async logout(rq: Request, rsp: Response) {
        rsp.cookie('__bruh', null, {
            httpOnly: true,
            maxAge: 0
        })

        return rsp.send({ message: 'Logged out' })
    }

    async remove(rq: Request, rsp: Response) {
        const { password } = rq.body;

        const user = await db('users').where('id', '=', rq.userId);

        if (user.length == 0)
            return rsp.status(400).send({ message: 'Invalid user' })

        const passwordCompare = await bcrypt.compare(password, user[0].password);

        if (!passwordCompare)
            return rsp.status(400).send({ message: 'Invalid password' })

        const trx = await db.transaction();

        await trx('users').where('id', '=', rq.userId).delete();

        await trx.commit();

        return rsp.send();
    }

    async index(rq: Request, rsp: Response) {
        const { id } = rq.params;

        try {
            const user = await db('users')
                .join('profile', 'users.id', 'profile.user_id')
                .select('users.*', 'profile.*')
                .where('profile.user_id', '=', id);

            if (user.length == 0) {
                return rsp.status(400).send({ message: 'Invalid Id' })
            }

            // total connections user got over students
            const totalConnections = await db('connections').where('user_id', '=', id).count('* as total');

            user[0] = {
                ...user[0],
                total_connections: totalConnections[0].total,
                email: undefined,
                password: undefined,
                user_id: undefined,
            }

            return rsp.status(200).send({ ...user[0] });
        } catch (error) {
            console.error(error)
            return rsp.status(400).send({ message: error });
        }
    }
}