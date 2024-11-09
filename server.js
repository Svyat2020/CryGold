const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Настройки для Express.js
const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к базе данных
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Ошибка при подключении к базе данных:', err.message);
    } else {
        console.log('Подключение к базе данных прошло успешно.');
    }
});

// Статические файлы (HTML, CSS, JavaScript)
app.use(express.static(path.join(__dirname, 'public')));

// API для получения информации о пользователе
app.get('/api/user/:id', (req, res) => {
    const userId = req.params.id;

    db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Ошибка при получении данных пользователя.' });
        } else {
            res.json(row);
        }
    });
});

// API для обновления баланса
app.post('/api/user/:id/click', (req, res) => {
    const userId = req.params.id;

    db.run('UPDATE users SET balance = balance + 1 WHERE user_id = ?', [userId], function (err) {
        if (err) {
            res.status(500).json({ error: 'Ошибка при обновлении баланса.' });
        } else {
            res.json({ message: 'Баланс успешно обновлен.' });
        }
    });
});

// API для получения таблицы лидеров
app.get('/api/leaderboard', (req, res) => {
    db.all('SELECT username, balance FROM users ORDER BY balance DESC LIMIT 10', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Ошибка при получении таблицы лидеров.' });
        } else {
            res.json(rows);
        }
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер работает по адресу http://localhost:${PORT}`);
});