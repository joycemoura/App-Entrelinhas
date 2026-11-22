import express from 'express';
import cors from 'cors';

import statusRoutes from './routes/statusRoutes.js';
import authRoutes from './routes/authRoutes.js';
import registrosHumorRoutes from './routes/registrosHumorRoutes.js';

const app = express();

app.disable('x-powered-by');
app.use(cors({
  origin: [
    'http://localhost:8081',
    'https://joycemoura.github.io',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '16kb' }));

app.use(statusRoutes);
app.use('/auth', authRoutes);
app.use('/registros-humor', registrosHumorRoutes);

app.use((req, res) => {
  res.status(404).json({
    mensagem: 'Rota não encontrada.',
  });
});

app.use((erro, req, res, next) => {
  if (res.headersSent) {
    return next(erro);
  }

  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({
      mensagem:
        'O corpo da requisição deve conter um JSON válido.',
    });
  }

  if (erro.type === 'entity.too.large') {
    return res.status(413).json({
      mensagem:
        'A requisição ultrapassa o tamanho permitido.',
    });
  }

  console.error(
    'Falha interna da API.',
    erro.code || 'ERRO_INTERNO'
  );

  return res.status(500).json({
    mensagem:
      'Não foi possível concluir a solicitação agora.',
  });
});

export default app;