// router.js

import express from 'express';
import passport from 'passport';

// Импортируем контроллеры и вспомогательные модули
import user from './controllers/user.js';
import passportController from './controllers/passport.js';
import meet from './controllers/meet.js';
import visit from './controllers/visit.js';
import image from './controllers/image.js';
import place from './controllers/place.js';
import project from './controllers/project.js';
import participation from './controllers/participation.js';
import chat from './controllers/chat.js';
import strategies from './strategies.js';
import { checkConstructor } from './helper.js';

const router = express.Router();

/**
 * Стратегии авторизации
 */
const authProviders = ['google', 'yandex'];

authProviders.forEach(provider => {
  passport.use(provider, strategies[provider]);

  router.get(`/login/${provider}`, passport.authenticate(provider));
  router.get(`/oauth2/redirect/${provider}`, (req, res, next) => {
    // Используем промисифицированную версию authenticate для совместимости с async/await
    passport.authenticate(provider, (err, user) => {
      if (err || !user) {
        return res.redirect('/login');
      }
      // Успешная аутентификация
      return res.redirect(`${process.env.FRONTEND_SERVER}/?access_token=${user.username}`);
    })(req, res, next);
  });
});

/**
 * Родитель (Passport)
 */
router.get('/passport', passportController.usePassport, passportController.all);
router.put('/passport', passportController.usePassport, passportController.update);

/**
 * Авторизация
 */
router.post('/passport/login', passportController.login);
router.post('/passport/googleLogin', passportController.googleLogin);

/**
 * Картинки
 */
router.post('/image', image.upload);

/**
 * Проекты
 */
router.get('/projects', passportController.usePassport, project.findAll);
router.get('/project/:id', passportController.usePassport, project.findById);
router.post('/project', passportController.usePassport, checkConstructor, project.create);
router.put('/project/:id', passportController.usePassport, checkConstructor, project.update);
router.delete('/project/:id', passportController.usePassport, project.delete);
router.get('/project/:id/meta', project.meta);

/**
 * Чат
 */
router.get('/chats', passportController.usePassport, chat.findAll);
router.get('/chat/:id/messages', passportController.usePassport, chat.findMessages);
router.post('/chat', passportController.usePassport, chat.createMessage);

/**
 * Места
 */
router.get('/places', passportController.usePassport, place.findAll);
router.post('/place', passportController.usePassport, place.create);

/**
 * Участие в проекте
 */
router.post('/participation', passportController.usePassport, participation.create);
router.delete('/participation/:id', passportController.usePassport, participation.delete);

/**
 * Встречи
 */
router.get('/meets', passportController.usePassport, meet.findAll);
router.get('/meet/:id', passportController.usePassport, meet.findById);
router.post('/meet', passportController.usePassport, checkConstructor, meet.create);
router.put('/meet/:id', passportController.usePassport, checkConstructor, meet.update);
router.delete('/meet/:id', passportController.usePassport, meet.delete);

/**
 * Посещения
 */
router.get('/visits', passportController.usePassport, visit.findAll);
router.post('/visit', passportController.usePassport, visit.create);
router.delete('/visit/:id', passportController.usePassport, visit.delete);

/**
 * Пользователи (Ребенок)
 */
router.get('/user/:id', passportController.usePassport, user.findById);
router.post('/user', passportController.usePassport, checkConstructor, user.create);
router.put('/user/:id', passportController.usePassport, checkConstructor, user.update);
router.delete('/user/:id', passportController.usePassport, user.delete);

export default router;
