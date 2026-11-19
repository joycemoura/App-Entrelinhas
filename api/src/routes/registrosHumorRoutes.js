import { Router } from 'express';

import * as controller from '../controllers/registrosHumorController.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.use(autenticar);
router.post('/', controller.gravarRegistroHumor ?? controller.criarRegistroHumor);

if (controller.listarRegistrosHumor) {
  router.get('/', controller.listarRegistrosHumor);
  router.get('/:id', controller.validarId, controller.consultarRegistroHumor);
  router.put('/:id', controller.validarId, controller.gravarRegistroHumor ?? controller.atualizarRegistroHumor);
  router.delete('/:id', controller.validarId, controller.excluirRegistroHumor);
}

export default router;