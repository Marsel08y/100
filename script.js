let score = 0, timeLeft = 30, currentUser = "", currentAnswer = 0, timerActive = false;

function nextQuestion() {
    const a = Math.floor(Math.random() * 30) + 1;
    const b = Math.floor(Math.random() * 30) + 1;
    currentAnswer = a + b;
    
    document.getElementById('question').innerText = `${a} + ${b}`;
    
    const input = document.getElementById('answer-input');
    input.value = "";
    input.disabled = false;
    input.style.pointerEvents = "auto";
    document.getElementById('feedback').innerText = "";
    
    setTimeout(() => input.focus(), 100);
    
    if(!timerActive) startTimer();
}

async function checkResult() {
    const input = document.getElementById('answer-input');
    const feedback = document.getElementById('feedback');
    const val = parseInt(input.value);

    if (isNaN(val)) return;

    if (val === currentAnswer) {
        // За правильный ответ +10 очков
        score += 10;
        document.getElementById('score').innerText = score;
        input.style.boxShadow = "0 0 15px #00ff88";
        setTimeout(nextQuestion, 300);
    } else {
        // ШТРАФ: При ошибке -5 очков
        score -= 5;
        if (score < 0) score = 0; // Чтобы счет не уходил в минус
        document.getElementById('score').innerText = score;

        input.disabled = true;
        input.classList.add('shake');
        
        // Красивое уведомление о штрафе
        feedback.innerHTML = `<span style="color:#ff0055">Ошибка (-5)! Ответ был: ${currentAnswer}</span>`;
        
        setTimeout(() => {
            input.classList.remove('shake');
            nextQuestion();
        }, 1500);
    }
}

function startTimer() {
    timerActive = true;
    const tick = setInterval(async () => {
        timeLeft--;
        document.getElementById('timer-text').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(tick);
            alert("ИГРА ЗАВЕРШЕНА! Ваш итоговый счет: " + score);
            await fetch('/api/rating', {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({name: currentUser, s: score})
            });
            location.reload();
        }
    }, 1000);
}

document.getElementById('start-game-btn').onclick = () => {
    const val = document.getElementById('username-input').value.trim();
    if (val) {
        currentUser = val;
        document.getElementById('auth-overlay').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';
        document.getElementById('display-username').innerText = currentUser;
        nextQuestion();
    }
};

document.getElementById('answer-input').onkeydown = (e) => { 
    if(e.key === 'Enter') checkResult(); 
};

document.getElementById('show-help-btn').onclick = () => {
    document.getElementById('help-modal').style.display = 'flex';
};

document.getElementById('show-tops-btn').onclick = async () => {
    const res = await fetch('/api/rating');
    const data = await res.json();
    document.getElementById('full-leaderboard').innerHTML = data.map((r,i) => 
        `<div class="leader-row"><span>${i+1}. ${r.name}</span><b>${r.s}</b></div>`
    ).join('');
    document.getElementById('tops-modal').style.display = 'flex';
};