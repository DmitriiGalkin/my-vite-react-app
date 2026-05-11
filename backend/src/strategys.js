'use strict';
const GoogleStrategy = require('passport-google-oauth20');
const MailStrategy = require('passport-mail');
const YandexStrategy = require('passport-yandex').Strategy;
const VKStrategy = require('passport-vkontakte').Strategy;

const Passport = require('./models/passport');
const API_URL = process.env.VITE_API_URL || process.env.BACKEND_SERVER;

function findOrCreate(accessToken, refreshToken, profile, cb) {
    console.log(profile,'profile')
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
                email,
                provider: profile.provider,
                providerId: profile.id,
            });
          Passport.create(user, function() {
                return cb(null, { username: accessToken });
            });
        }
    })
}


function createStrategy(Strategy, provider, options = {}) {
    console.log(process.env[`${provider}_STRATEGY_CLIENT_ID`],'process.env[`${provider}_STRATEGY_CLIENT_ID`]')
    return new Strategy({
        clientID: process.env[`${provider}_STRATEGY_CLIENT_ID`],
        clientSecret: process.env[`${provider}_STRATEGY_CLIENT_SECRET`],
        callbackURL: `${API_URL}/oauth2/redirect/${provider.toLowerCase()}`,
        ...options,
    }, findOrCreate);
}

exports.google = createStrategy(GoogleStrategy, 'GOOGLE', {
    scope: ['profile', 'email'],
    state: false,
});

exports.mailru = createStrategy(MailStrategy, 'MAILRU');

exports.yandex = createStrategy(YandexStrategy, 'YANDEX');

exports.vkontakte = createStrategy(VKStrategy, 'VKONTAKTE');
