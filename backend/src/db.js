// db.js
// 'use strict';
const mysql = require('mysql2/promise');

// Создаем пул соединений
const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_DATABASE ?? 'my_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --- НАЧАЛО БЛОКА ПРОВЕРКИ СОЕДИНЕНИЯ ---
// Эта функция проверит, можем ли мы получить соединение из пула.
// Если да — значит, БД доступна.
async function checkConnection() {
  try {
    // Пытаемся получить одно соединение из пула
    const connection = await pool.getConnection();

    // Если мы здесь, значит, соединение успешно.
    // Выводим информацию о подключении.
    console.log(
      `✅ Успешно подключено к БД '${process.env.DB_DATABASE ?? 'my_database'}' на порту ${connection.config.port}`,
    );

    // Обязательно (!) возвращаем соединение обратно в пул,
    // иначе пул будет "заблокирован" и новые запросы не пройдут.
    connection.release();
  } catch (err) {
    // Если не удалось подключиться, выводим ошибку
    console.error('❌ Не удалось подключиться к базе данных:', err.message);
    // Можно также завершить процесс, если БД критически важна
    // process.exit(1);
  }
}

// Вызываем проверку сразу при запуске приложения
checkConnection();

// Обработка глобальных ошибок пула (например, потеря соединения)
pool.on('error', err => {
  console.error('❗ Ошибка в пуле соединений MySQL:', err);
});

module.exports = pool;
