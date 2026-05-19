// 'use strict';
const GoogleStrategy = require('passport-google-oauth20');
const YandexStrategy = require('passport-yandex').Strategy;

const Passport = require('./models/passport'); // Убедитесь, что модель обновлена
const API_URL = process.env.VITE_API_URL || process.env.BACKEND_SERVER;

/**
 * Основная функция для поиска или создания пользователя.
 * Теперь она async и использует try/catch для обработки ошибок.
 */
async function findOrCreate(accessToken, refreshToken, profile, done) {
  try {
    // Получаем email. Если нет, используем profileUrl как fallback.
    const email =
      profile.emails && profile.emails.length
        ? profile.emails[0].value
        : `${profile.username}@${profile.provider}.com`; // Лучше создать fallback-email

    // Получаем ссылку на фото, если есть
    const image = profile.photos && profile.photos.length ? profile.photos[0].value : null;

    // 1. Ищем пользователя по email
    const existingUser = await Passport.findByEmail(email);

    if (existingUser) {
      // 2. Если пользователь найден - обновляем его токен
      await Passport.updateTokenById(accessToken, existingUser.id);
      // Возвращаем пользователя в Passport
      return done(null, { username: accessToken });
    }

    // 3. Если пользователя нет - создаем нового
    const newUserData = {
      accessToken: accessToken,
      title: profile.displayName,
      image: image,
      email: email,
      provider: profile.provider,
      providerId: profile.id,
    };

    const createdUserId = await Passport.create(newUserData);
    // Находим и возвращаем только что созданного пользователя
    const newUser = await Passport.findById(createdUserId);

    return done(null, newUser);
  } catch (err) {
    // Любая ошибка (в БД или другом месте) передается в done
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
    findOrCreate, // Передаем нашу новую асинхронную функцию
  );
}

// Экспортируем настроенные стратегии
exports.google = createStrategy(GoogleStrategy, 'GOOGLE', {
  scope: ['profile', 'email'],
  state: false,
});

exports.yandex = createStrategy(YandexStrategy, 'YANDEX');
