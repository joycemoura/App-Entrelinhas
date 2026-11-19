import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import { cadastrar, entrar, consultarMeuPerfil } from '../controllers/authController.js';
import pool from '../database/pool.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

function limitarTentativas() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { mensagem: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
  });
}

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.post('/cadastro', limitarTentativas(), cadastrar);
router.post('/login', limitarTentativas(), entrar);
router.get('/me', autenticar, consultarMeuPerfil);

router.delete('/me', autenticar, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM public.usuarios WHERE id = $1', [req.usuario.id]);
    return res.json({ mensagem: 'Conta excluída.' });
  } catch (erro) {
    return next(erro);
  }
});

export default router;