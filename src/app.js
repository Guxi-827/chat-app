const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const crypto = require('crypto');

// 加載 .env 文件中的環境變量
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY;
const PASSWORD = process.env.PASSWORD; // 從環境變量讀取密碼

// 生成隨機用戶名的函數
function generateRandomUsername() {
    return 'User_' + crypto.randomBytes(4).toString('hex');
}

app.post('/auth', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
        const username = generateRandomUsername();
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ success: true, token });
    } else {
        res.json({ success: false });
    }
});

io.use((socket, next) => {
    const token = socket.handshake.query.token;
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.username = decoded.username;
        next();
    });
}).on('connection', (socket) => {
    console.log(`${socket.username} connected`);
    socket.on('chat message', (msg) => {
        io.emit('chat message', { user: socket.username, text: msg.text });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
