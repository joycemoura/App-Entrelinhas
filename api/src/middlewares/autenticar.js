import pool from '../database/pool.js';

import {
  verificarToken,
} from '../config/autenticacao.js';

export default async function autenticar(req, res, next) {
  const cabecalho = req.get('Authorization') || '';

  const partes = /^Bearer\s+(\S+)$/i.exec(cabecalho);

  function negar() {
    return res.status(401).json({
      mensagem: 'Entre na sua conta para continuar.',
    });
  }

  if (!partes) {
    return negar();
  }

  let dados;

  try {
    dados = verificarToken(partes[1]);

    if (
      typeof dados !== 'object' ||
      !/^[1-9]\d*$/.test(dados.sub || '')
    ) {
      return negar();
    }

    if (Number(dados.sub) > 2147483647) {
      return negar();
    }
  } catch {
    return negar();
  }

  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, telefone, criado_em
       FROM public.usuarios
       WHERE id = $1`,
      [dados.sub]
    );

    if (!resultado.rows[0]) {
      return negar();
    }

    req.usuario = resultado.rows[0];

    return next();
  } catch (erro) {
    return next(erro);
  }
}