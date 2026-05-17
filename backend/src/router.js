const express = require('express')
const router = express.Router()
var passport = require('passport');

const user =   require('./controllers/user');
const passportController =   require('./controllers/passport');
const meet =   require('./controllers/meet');
const visit =   require('./controllers/visit');
const image =   require('./controllers/image');
const place =   require('./controllers/place');
const project =   require('./controllers/project');
const participation =   require('./controllers/participation');
const chat =   require('./controllers/chat');
const strategys =   require('./strategys');
const helper =   require('./helper');

/**
 * Стратегии авторизации
 */
const authProviders = ['google', 'yandex']; //', 'vkontakte', 'mailru'

authProviders.forEach((provider) => {
    passport.use(provider, strategys[provider]);

    router.get(`/login/${provider}`, passport.authenticate(provider));
    router.get(`/oauth2/redirect/${provider}`, (req, res) => {
        passport.authenticate(provider, function(err, user) {
            if (err || !user) {
                return res.redirect('/login');
            }

            return res.redirect(`${process.env.FRONTEND_SERVER}/?access_token=${user.username}`);
        })(req, res);
    });
});

/**
 * Родитель
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
router.post('/project', passportController.usePassport, helper.checkConstructor, project.create);
router.put('/project/:id', passportController.usePassport, helper.checkConstructor, project.update);
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
router.delete('/participation/:id', passportController.usePassport, participation.delete );

/**
 * Встречи
 */
router.get('/meets', passportController.usePassport, meet.findAll);
router.get('/meet/:id', passportController.usePassport, meet.findById);
router.post('/meet', passportController.usePassport, helper.checkConstructor, meet.create);
router.put('/meet/:id', passportController.usePassport, helper.checkConstructor, meet.update);
router.delete('/meet/:id', passportController.usePassport, meet.delete );

/**
 * Посещения
 */
router.get('/visits', passportController.usePassport, visit.findAll);
router.post('/visit', passportController.usePassport, visit.create );
router.delete('/visit/:id', passportController.usePassport, visit.delete );

/**
 * Ребенок
 */
router.get('/user/:id', passportController.usePassport, user.findById);
router.post('/user', passportController.usePassport, helper.checkConstructor, user.create);
router.put('/user/:id', passportController.usePassport, helper.checkConstructor, user.update);
router.delete('/user/:id', passportController.usePassport, user.delete );

module.exports = router
