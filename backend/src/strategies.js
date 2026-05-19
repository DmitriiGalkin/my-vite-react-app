import GoogleStrategy from 'passport-google-oauth20';
import { Strategy as YandexStrategy } from 'passport-yandex'; // Импорт с алиасом

import Passport from './models/passport.js'; // Обновляем расширение на .js

const API_URL = process.env.VITE_API_URL || process.env.BACKEND_SERVER;

/**
 * Основная функция для поиска или создания пользователя.
 * Теперь она async и использует try/catch для обработки ошибок.
 */
async function findOrCreate(accessToken, refreshToken, profile, done) {
  try {
    const email =
      profile.emails && profile.emails.length
        ? profile.emails[0].value
        : `${profile.username}@${profile.provider}.com`;

    const image = profile.photos && profile.photos.length ? profile.photos[0].value : null;

    const existingUser = await Passport.findByEmail(email);

    if (existingUser) {
      await Passport.updateTokenById(accessToken, existingUser.id);
      // Возвращаем объект, который будет сериализован в сессию
      return done(null, { username: accessToken });
    }

    const newUserData = {
      accessToken,
      title: profile.displayName,
      image,
      email,
      provider: profile.provider,
      providerId: profile.id,
    };

    const createdUserId = await Passport.create(newUserData);
    const newUser = await Passport.findById(createdUserId);

    return done(null, newUser);
  } catch (err) {
    console.error('Ошибка в стратегии Passport:', err);
    return done(err);
  }
}

/**
 * Функция для создания экземпляра стратегии.
 * Логика остается прежней, так как она синхронная.
 */
function createStrategy(Strategy, provider, options = {}) {
  return new Strategy(
    {
      clientID: process.env[`${provider}_STRATEGY_CLIENT_ID`],
      clientSecret: process.env[`${provider}_STRATEGY_CLIENT_SECRET`],
      callbackURL: `${API_URL}/oauth2/redirect/${provider.toLowerCase()}`,
      ...options,
    },
    // ВАЖНО: Асинхронные функции в стратегиях Passport требуют особого подхода.
    // Мы оборачиваем нашу async-функцию в функцию, которая принимает `done`.
    (accessToken, refreshToken, profile, done) => {
      findOrCreate(accessToken, refreshToken, profile, done).catch(done);
    },
  );
}

// Экспорт по умолчанию с готовыми стратегиями
export default {
  google: createStrategy(GoogleStrategy, 'GOOGLE', {
    scope: ['profile', 'email'],
    state: false,
  }),
  yandex: createStrategy(YandexStrategy, 'YANDEX'),
};
