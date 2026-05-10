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
const idea = require('./controllers/idea');
const participation =   require('./controllers/participation');
const invite =   require('./controllers/invite');
const meta = require('./controllers/meta');
const strategys =   require('./strategys');
const helper =   require('./helper');

/**
 * Стратегии авторизации
 */
passport.use(strategys.google);
passport.use(strategys.mailru);
passport.use(strategys.yandex);
passport.use(strategys.vkontakte);


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
router.get('/login/google', passport.authenticate('google'));
router.get('/oauth2/redirect/google', (req, res) => passport.authenticate('google', function(err, user) {
    console.log(user,'user')
    if (!user) { return res.redirect('/login'); }
    res.redirect(process.env.FRONTEND_SERVER + '/?access_token=' + user.username);
})(req, res));
router.get('/login/mailru', passport.authenticate('mailru'));
router.get('/oauth2/redirect/mailru', (req, res) => passport.authenticate('mailru', function(err, user) {
    if (!user) { return res.redirect('/login'); }
    res.redirect(process.env.FRONTEND_SERVER + '/?access_token=' + user.username);
})(req, res));
router.get('/login/yandex', passport.authenticate('yandex'));
router.get('/oauth2/redirect/yandex', (req, res) => passport.authenticate('yandex', function(err, user) {
    if (!user) { return res.redirect('/login'); }
    res.redirect(process.env.FRONTEND_SERVER + '/?access_token=' + user.username);
})(req, res));
router.get('/login/vkontakte', passport.authenticate('vkontakte'));
router.get('/oauth2/redirect/vkontakte', (req, res) => passport.authenticate('vkontakte', function(err, user) {
    if (!user) { return res.redirect('/login'); }
    console.log(user,'user')
    res.redirect(process.env.FRONTEND_SERVER + '/?access_token=' + user.username);
})(req, res));

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
router.delete('/project/:id', passportController.usePassport, project.delete );

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
router.post('/visit/:id/started', passportController.usePassport, visit.started );
router.post('/visit/:id/stopped', passportController.usePassport, visit.stopped );
router.post('/visit/:id/paided', passportController.usePassport, visit.paided );
router.delete('/visit/:id', passportController.usePassport, visit.delete );

/**
 * Ребенок
 */
router.get('/user/:id', passportController.usePassport, user.findById);
router.post('/user', passportController.usePassport, helper.checkConstructor, user.create);
router.put('/user/:id', passportController.usePassport, helper.checkConstructor, user.update);
router.delete('/user/:id', passportController.usePassport, user.delete );

/**
 * Идеи
 */
router.get('/ideas', passportController.usePassport, idea.findAll);
router.get('/idea/:id', passportController.usePassport, idea.findById);
router.post('/idea', passportController.usePassport, helper.checkConstructor, idea.create);
router.put('/idea/:id', passportController.usePassport, helper.checkConstructor, idea.update);
router.delete('/idea/:id', passportController.usePassport, idea.delete );

/**
 * Приглашения
 */
router.post('/invite', passportController.usePassport, invite.create);
router.delete('/invite/:id', passportController.usePassport, invite.delete );
router.post('/invite/:id/accept', passportController.usePassport, invite.accept );

/**
 * Мета
 */
router.get('/meta/:type/:id', meta.get );

module.exports = router
