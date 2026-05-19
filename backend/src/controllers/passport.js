// controllers/passportController.js
// 'use strict';
const Passport = require('../models/passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Обновление профиля пользователя
exports.update = async (req, res) => {
  try {
    // Проверка, что тело запроса не пустое
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ error: true, message: 'Пожалуйста, предоставьте данные для обновления' });
    }

    // Обновляем данные в БД
    await Passport.update(req.passport.id, new Passport(req.body));

    // Возвращаем успех. В реальном приложении лучше вернуть обновленные данные.
    res.json({ error: false, message: 'Профиль успешно обновлен' });
  } catch (err) {
    console.error('Passport update error:', err);
    res.status(500).json({ error: true, message: 'Ошибка при обновлении профиля' });
  }
};

// Вход через Google (и другие OAuth)
exports.googleLogin = async (req, res) => {
  try {
    const { email, access_token, name, picture } = req.body;

    // Проверка входящих данных
    if (!email || !access_token) {
      return res.status(400).json({ error: true, message: 'Не хватает данных от провайдера' });
    }

    // Ищем пользователя по email
    const existingPassport = await Passport.findByEmail(email);

    if (existingPassport) {
      // Если пользователь есть - обновляем его токен
      await Passport.updateTokenById(access_token, existingPassport.id);
      return res.json({ error: false, message: 'Токен пользователя обновлен' });
    }

    // Если пользователя нет - создаем нового
    const newPassportData = {
      token: access_token,
      title: name,
      image: picture,
      email: email,
    };

    const newPassport = new Passport(newPassportData);
    await Passport.create(newPassport);

    res.json({ error: false, message: 'Новый пользователь успешно создан' });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: true, message: 'Ошибка при входе через Google' });
  }
};

// Авторизация участника (Login)
exports.login = async (req, res) => {
  try {
    // В вашем коде был хардкод findById(1). Это небезопасно.
    // Предполагаем, что мы ищем по email и паролю из req.body.
    // Для примера оставим логику генерации токена.

    // В реальности здесь должна быть проверка email/password
    // const user = await Passport.findByCredentials(req.body.email, req.body.password);

    // Генерируем JWT токен. Секретный ключ должен быть в переменной окружения.
    const token = jwt.sign({ id: req.passport.id }, process.env.JWT_SECRET || 'shhhhh', {
      expiresIn: '1h',
    });

    // Сохраняем токен в БД для пользователя
    await Passport.updateTokenById(token, req.passport.id);

    res.json({ access_token: token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: true, message: 'Неверный email или пароль' });
  }
};

// Получение информации о текущем пользователе (Профиль)
exports.findById = async (req, res) => {
  try {
    // Так как мы уже авторизовали пользователя в middleware,
    // его данные уже находятся в req.passport.
    // Запрашивать их снова из БД не обязательно.

    if (!req.passport) {
      return res.status(401).json({ error: true, message: 'Пользователь не авторизован' });
    }

    res.json(req.passport);
  } catch (err) {
    console.error('Find by ID error:', err);
    res.status(500).json({ error: true, message: 'Ошибка получения данных профиля' });
  }
};

// Вся информация по паспорту (Профиль + связанные пользователи)
exports.all = async (req, res) => {
  try {
    if (!req.passport) {
      return res.status(401).json({ error: true, message: 'Паспорт отсутствует' });
    }

    // Получаем список связанных пользователей
    const users = await User.findByPassportId(req.passport.id);

    // Отправляем объект паспорта и массив пользователей
    res.json({
      ...req.passport,
      users,
    });
  } catch (err) {
    console.error('All data error:', err);
    res.status(500).json({ error: true, message: 'Ошибка получения полной информации' });
  }
};

/**
 * Middleware для авторизации по токену
 */
exports.usePassport = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Если токена нет, просто идем дальше
    return next();
  }

  try {
    // Ищем паспорт по токену
    const passport = await Passport.findByAccessToken(token);

    if (!passport) {
      // Токен не найден в базе. Возможно, он протух или отозван.
      return res.status(401).json({ error: true, message: 'Токен недействителен или протух' });
    }

    // Присваиваем паспорт объекту запроса для использования в других обработчиках
    req.passport = passport;

    // Получаем связанных пользователей и также кладем в запрос
    const users = await User.findByPassportId(passport.id);
    req.users = users;

    next(); // Передаем управление следующему middleware/роуту
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: true, message: 'Ошибка авторизации' });
  }
};
