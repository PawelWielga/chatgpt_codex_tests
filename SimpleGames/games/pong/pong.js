document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('pong-start');
    const scoreEl = document.getElementById('pong-score');

    const width = canvas.width;
    const height = canvas.height;
    let leftPaddle, rightPaddle, ball, score, timer;

    function reset() {
        leftPaddle = { x: 10, y: height / 2 - 30, w: 10, h: 60, vy: 0 };
        rightPaddle = { x: width - 20, y: height / 2 - 30, w: 10, h: 60, vy: 0 };
        ball = { x: width / 2, y: height / 2, r: 5, vx: 3 * (Math.random() > 0.5 ? 1 : -1), vy: 2 * (Math.random() > 0.5 ? 1 : -1) };
        score = { left: 0, right: 0 };
        scoreEl.textContent = '0 : 0';
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.w, leftPaddle.h);
        ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.w, rightPaddle.h);
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
    }

    function update() {
        leftPaddle.y += leftPaddle.vy;
        rightPaddle.y += rightPaddle.vy;
        leftPaddle.y = Math.max(0, Math.min(height - leftPaddle.h, leftPaddle.y));
        rightPaddle.y = Math.max(0, Math.min(height - rightPaddle.h, rightPaddle.y));

        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y < ball.r || ball.y > height - ball.r) {
            ball.vy *= -1;
        }

        if (ball.x - ball.r < leftPaddle.x + leftPaddle.w &&
            ball.y > leftPaddle.y &&
            ball.y < leftPaddle.y + leftPaddle.h &&
            ball.vx < 0) {
            ball.vx *= -1;
        }
        if (ball.x + ball.r > rightPaddle.x &&
            ball.y > rightPaddle.y &&
            ball.y < rightPaddle.y + rightPaddle.h &&
            ball.vx > 0) {
            ball.vx *= -1;
        }

        if (ball.x < 0) {
            score.right++;
            resetBall();
        } else if (ball.x > width) {
            score.left++;
            resetBall();
        }
        scoreEl.textContent = `${score.left} : ${score.right}`;
    }

    function resetBall() {
        ball.x = width / 2;
        ball.y = height / 2;
        ball.vx *= -1;
    }

    function loop() {
        update();
        draw();
    }

    startBtn.addEventListener('click', () => {
        clearInterval(timer);
        reset();
        timer = setInterval(loop, 16);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'w') leftPaddle.vy = -4;
        else if (e.key === 's') leftPaddle.vy = 4;
        else if (e.key === 'ArrowUp') rightPaddle.vy = -4;
        else if (e.key === 'ArrowDown') rightPaddle.vy = 4;
    });
    document.addEventListener('keyup', e => {
        if (e.key === 'w' || e.key === 's') leftPaddle.vy = 0;
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') rightPaddle.vy = 0;
    });
});
