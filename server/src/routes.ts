import express from 'express';
import multer from 'multer';
import {celebrate, Joi, Segments} from 'celebrate';
import multerConfig from './config/multer';
import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import UserController from './controllers/UserController';
import ProfileController from './controllers/ProfileController';
import authMiddleware from './utils/auth';
import rateLimit from 'express-rate-limit';

const routes = express.Router();
const upload = multer(multerConfig);
const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const userController = new UserController();
const profileController = new ProfileController();

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    handler: (_, rsp) => {
        rsp.status(429).send({ message: 'You are being rate limited, please try again later.' })
    }
});

const classesListingLimiter = rateLimit({
    windowMs: 45 * 60 * 1000, // 45 minutes
    max: 400,
    handler: (_, rsp) => {
        rsp.status(429).send({ message: 'You have seen too many classes, why not take a break? ☕' })
    }
});

const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    handler: (_, rsp) => {
        rsp.status(429).send({ message: 'You are being rate limited, please try again later.' })
    }
});

///////////////////////////////////////////////////////////////

routes.post('/register', celebrate({
    [Segments.BODY]: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(8),
    })
}, {abortEarly: false}), userController.create);

routes.post('/authenticate', celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        remember_me: Joi.boolean().required(),
    })
}, {abortEarly: false}), userController.authenticate);

routes.get('/verify', verifyLimiter, authMiddleware, userController.verify);

routes.post('/forgot_password', celebrate({
    [Segments.BODY]: Joi.object().keys({
        email: Joi.string().required().email(),
    })
}, {abortEarly: false}), userController.forgot);

routes.post('/reset_password', celebrate({
    [Segments.BODY]: Joi.object().keys({
        token: Joi.string().required(),
        password: Joi.string().required().min(8),
    })
}, {abortEarly: false}), userController.reset);

routes.get('/confirmation/:token', userController.confirm);

routes.get('/logout', authMiddleware, userController.logout);

routes.delete('/user/delete', authMiddleware, userController.remove);

///////////////////////////////////////////////////////////////

routes.get('/profile/:id', authMiddleware, userController.index);

routes.put('/profile', uploadLimiter, authMiddleware, upload.single('avatar'), celebrate({
    [Segments.BODY]: Joi.object().keys({
        whatsapp: Joi.string().optional(),
        bio: Joi.string().optional(),
		name: Joi.string().optional()
    })
}, {abortEarly: false}), profileController.edit);

///////////////////////////////////////////////////////////////

routes.post('/classes', authMiddleware, classesController.create);

routes.get('/total_classes', authMiddleware, classesController.total);

routes.get('/classes', classesListingLimiter, authMiddleware, classesController.index);

routes.delete('/classes/:id', authMiddleware, classesController.delete);

routes.put('/classes/:id', authMiddleware, classesController.edit);

///////////////////////////////////////////////////////////////

routes.post('/connections', authMiddleware, connectionsController.create);

routes.get('/connections', authMiddleware, connectionsController.index);

export default routes;