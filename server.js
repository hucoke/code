import express from 'express';
import cors from 'cors';
import db from './db.js';
import barcodeRoutes from './routes/barcodes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/barcodes', barcodeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  db.initialize();
});