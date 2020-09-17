import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';
import cookieParser from 'cookie-parser';
import {errors} from 'celebrate';
import rateLimit from 'express-rate-limit';
require('dotenv/config');

const app = express();

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    handler: (_, rsp) => {
        return rsp.status(429).send({ message: 'You are being rate limited. Please try again later.' })
    }
});

let host = '';
if (process.env.WEB_HOST == '' || process.env.WEB_HOST == undefined) {
	host += 'http://localhost';
} else {
    host += process.env.WEB_HOST;
}
if (process.env.WEB_PORT != '' || process.env.WEB_PORT != undefined) {
	host += ':'+process.env.WEB_PORT
}

app.use('/api/', apiLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(cors({
	credentials: true,
	origin: host,
	exposedHeaders: ['X-Total-Count'],
}));
app.use('/api/v2', routes);
app.use(errors());

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

app.listen(3333);