'use strict';
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'host',
  user: process.env.DB_USER ?? 'user',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_DATABASE ?? 'database',
  waitForConnections: true, // ждать, если нет свободных соединений
  connectionLimit: 10, // максимальное количество соединений в пуле
  queueLimit: 0, // сколько запросов может ждать в очереди (0 — без ограничений)
});

// Обработка глобальных ошибок пула (например, потеря соединения)
pool.on('error', (err) => {
  console.error('Ошибка в пуле соединений MySQL:', err);
  // Здесь можно реализовать логику переподключения или оповещения
});

module.exports = pool;