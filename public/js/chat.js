const socket = io();
let username;

function login() {
    const password = document.getElementById('password').value;
    fetch('/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('login').style.display = 'none';
            document.getElementById('chat').style.display = 'block';
            // 將 token 傳遞給 socket.io
            socket.io.opts.query = { token: data.token };
            // 解析 token 以獲取用戶名
            const decodedToken = parseJwt(data.token);
            username = decodedToken.username;
            socket.connect();
        } else {
            alert('密碼錯誤');
        }
    });
}

function sendMessage() {
    const message = document.getElementById('message').value;
    socket.emit('chat message', { text: message }); // 保持這裡不變
    document.getElementById('message').value = '';
}

socket.on('chat message', function(msg) {
    const item = document.createElement('div');
    item.textContent = `${msg.user}: ${msg.text}`; // 確保正確處理消息對象
    document.getElementById('messages').appendChild(item);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

// 監聽 Enter 鍵事件以登錄
document.getElementById('password').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        login();
    }
});

// 監聽 Enter 鍵事件以發送訊息
document.getElementById('message').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// 用於解析 JWT token 的函數
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString('16')).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
