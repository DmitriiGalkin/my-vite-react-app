'use strict';
const GoogleStrategy = require('passport-google-oauth20');
const MailStrategy = require('passport-mail');
const YandexStrategy = require('passport-yandex').Strategy;
const VKStrategy = require('passport-vkontakte').Strategy;

const Passport = require('./models/passport');

function findOrCreate(accessToken, refreshToken, profile, cb) {
    // Не все системы авторизации даруют мне почту
    const email = profile.emails && profile.emails.length ? profile.emails[0].value : profile.profileUrl
    // const image = profile?.photos?.length ? profile.photos[0].value : '22'

    Passport.findByEmail(email, function(err, user) {
        if (user) {
          Passport.updateTokenById(accessToken, user.id, function() {
                return cb(null, { username: accessToken });
            });
        } else {
            const user = new Passport({
                accessToken,
                title: profile.displayName,
                // image,
                email
            });
          Passport.create(user, function(err, data) {
                return cb(null, { username: accessToken });
            });
        }
    })
}

exports.google = new GoogleStrategy({
        clientID: process.env.GOOGLE_STRATEGY_CLIENT_ID,
        clientSecret: process.env.GOOGLE_STRATEGY_CLIENT_SECRET,
        callbackURL: process.env.BACKEND_SERVER + '/oauth2/redirect/google',
        scope: [ 'profile', 'email' ],
        state: false
    }, findOrCreate
)

exports.mailru = new MailStrategy({
        clientID: process.env.MAILRU_STRATEGY_CLIENT_ID,
        clientSecret: process.env.MAILRU_STRATEGY_CLIENT_SECRET,
        callbackURL: process.env.BACKEND_SERVER + '/oauth2/redirect/mailru',
    }, findOrCreate
)

exports.yandex = new YandexStrategy({
        clientID: process.env.YANDEX_STRATEGY_CLIENT_ID,
        clientSecret: process.env.YANDEX_STRATEGY_CLIENT_SECRET,
        callbackURL: process.env.BACKEND_SERVER + '/oauth2/redirect/yandex',
    }, findOrCreate
)

exports.vkontakte = new VKStrategy({
        clientID: process.env.VKONTAKTE_STRATEGY_CLIENT_ID,
        clientSecret: process.env.VKONTAKTE_STRATEGY_CLIENT_ID,
        callbackURL: process.env.BACKEND_SERVER + '/oauth2/redirect/vkontakte',
    }, findOrCreate
)
