import { Router } from 'express';

const statusRoutes = Router();

statusRoutes.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    servico: 'entrelinhas-api',
  });
});

export default statusRoutes;