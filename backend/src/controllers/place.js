// controllers/placeController.js
// 'use strict';

const Place = require('../models/place');

/**
 * Получение списка всех мест.
 * Логика с latitude/longitude в запросе была убрана,
 * так как в обновленной модели Place.findAll() не принимает аргументов.
 */
exports.findAll = async (req, res) => {
  try {
    // Прямой вызов асинхронного метода модели
    const places = await Place.findAll();
    res.json(places);
  } catch (err) {
    console.error('place.findAll error:', err);
    res.status(500).json({ error: true, message: 'Не удалось получить список мест' });
  }
};

/**
 * Создание нового места.
 */
exports.create = async (req, res) => {
  try {
    // Проверка на пустое тело запроса
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ error: true, message: 'Пожалуйста, предоставьте все необходимые поля' });
    }

    // Прямой вызов асинхронного метода модели
    // Метод create() теперь возвращает ID созданной записи
    const newPlaceId = await Place.create(req.body);

    // Возвращаем ID созданного места с правильным статусом 201 (Created)
    res.status(201).json({ message: 'Место успешно создано', id: newPlaceId });
  } catch (err) {
    console.error('place.create error:', err);
    res.status(500).json({ error: true, message: 'Не удалось создать место' });
  }
};
