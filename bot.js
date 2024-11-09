
const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Set up Telegram bot
const TOKEN = '7457639536:AAHGkwb-a2QF3ilpDPpm9DzTZgsGOnVb3kc';
const bot = new TelegramBot(TOKEN, { polling: true });

// Set up SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Ошибка при подключении к базе данных:', err.message);
    } else {
        console.log('Подключение к базе данных прошло успешно.');
    }
});

// Create users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username TEXT,
    balance INTEGER DEFAULT 0,
    referral_id INTEGER
)`);

// Create transactions table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Web server setup
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/game.html');
});

app.listen(PORT, () => {
    console.log(`Сервер работает по адресу: http://localhost:${PORT}`);
});

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;

    // Insert or ignore new user in the users table
    db.run(`INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)`, [userId, username], function (err) {
        if (err) {
            console.error('Ошибка при добавлении пользователя:', err.message);
            bot.sendMessage(userId, 'Произошла ошибка при регистрации. Попробуйте позже.');
        } else {
            bot.sendMessage(userId, `Привет, ${username}! Добро пожаловать в TapSwap Game. Нажмите на кнопку, чтобы играть.`, {
                reply_markup: {
                    inline_keyboard: [[{ text: "Играть", callback_data: "play_game" }]]
                }
            });
        }
    });
});

// Handle play_game button click
bot.on('callback_query', (callbackQuery) => {
    const userId = callbackQuery.from.id;
    const action = callbackQuery.data;

    if (action === 'play_game') {
        bot.sendMessage(userId, 'Нажмите на ссылку, чтобы начать играть: http://localhost:' + PORT);
    }
});

// Handle /referral command
bot.onText(/\/referral/, (msg) => {
    const userId = msg.from.id;

    // Generate referral link
    const referralLink = `https://t.me/crygold_bot?start=${userId}`;

    bot.sendMessage(userId, `Ваша реферальная ссылка: ${referralLink}
Приглашайте друзей и получайте награды!`);
});

// Handle clicking coin in web app (pseudo-code for example purposes)
// You would use a front-end JavaScript code to handle clicking and communicate with the backend to update the user's balance.
app.post('/click', (req, res) => {
    const userId = req.body.userId;

    // Increment balance by 1
    db.run(`UPDATE users SET balance = balance + 1 WHERE user_id = ?`, [userId], function (err) {
        if (err) {
            console.error('Ошибка при обновлении баланса:', err.message);
            res.status(500).send('Ошибка при обновлении баланса.');
        } else {
            res.send('Баланс успешно обновлен.');
        }
    });
});

