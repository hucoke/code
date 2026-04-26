import express from 'express';
import cors from 'cors';
import db from './db.js';
import barcodeRoutes from './routes/barcodes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/barcodes', barcodeRoutes);

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.validateUser(username, password, (user) => {
    if (user) {
      res.json({ success: true, message: '登录成功', user: { username: user.username } });
    } else {
      res.json({ success: false, message: '用户名或密码错误' });
    }
  });
});

app.get('/api/users', (req, res) => {
  db.getAllUsers((users) => {
    res.json({ success: true, users });
  });
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  db.saveUser(user, (err) => {
    if (err) {
      res.json({ success: false, message: '添加用户失败' });
    } else {
      res.json({ success: true, message: '添加用户成功' });
    }
  });
});

app.put('/api/users', (req, res) => {
  const user = req.body;
  db.saveUser(user, (err) => {
    if (err) {
      res.json({ success: false, message: '更新用户失败' });
    } else {
      res.json({ success: true, message: '更新用户成功' });
    }
  });
});

app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  db.deleteUser(userId, (err) => {
    if (err) {
      res.json({ success: false, message: '删除用户失败' });
    } else {
      res.json({ success: true, message: '删除用户成功' });
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  db.initialize();
});