document.getElementById('play-button').addEventListener('click', () => {
    const userId = 1;  // Замените на идентификатор реального пользователя
    const amount = Math.floor(Math.random() * 10) + 1;  // Генерация монет от 1 до 10

    fetch('/api/update_balance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, amount: amount }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateBalance(amount);
            loadLeaderboard();
        }
    });
});

function updateBalance(amount) {
    const balanceElement = document.getElementById('balance').getElementsByTagName('span')[0];
    balanceElement.textContent = parseInt(balanceElement.textContent) + amount;
}

function loadLeaderboard() {
    fetch('/api/leaderboard')
    .then(response => response.json())
    .then(data => {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        data.forEach((user) => {
            const li = document.createElement('li');
            li.textContent = ${user.username || 'User'}: ${user.balance} монет;
            leaderboardList.appendChild(li);
        });
    });
}

loadLeaderboard();