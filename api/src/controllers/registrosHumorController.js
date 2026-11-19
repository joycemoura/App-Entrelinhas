import pool from '../database/pool.js';

const campos = 'id, humor, contextos, titulo, anotacao, registrado_em';

function textoValido(valor) {
  return typeof valor === 'string' && !valor.includes('\u0000');
}

function dataValida(valor) {
  if (typeof valor !== 'string') return false;
  const data = new Date(valor);
  return Number.isFinite(data.getTime()) &&
    data.getUTCFullYear() >= 1 &&
    data.getUTCFullYear() <= 9999 &&
    data.toISOString() === valor;
}

function lerRegistro(corpo) {
  const { humor, contextos = [], titulo, anotacao, registrado_em } = corpo ?? {};
  const erros = {};

  if (!Number.isInteger(humor) || humor < 1 || humor > 5) {
    erros.humor = 'Escolha um humor de 1 a 5.';
  }
  if (!Array.isArray(contextos) || contextos.some((item) => !textoValido(item) || !item.trim())) {
    erros.contextos = 'Confira os contextos selecionados.';
  }
  if (titulo != null && !textoValido(titulo)) erros.titulo = 'Confira o título.';
  if (anotacao != null && !textoValido(anotacao)) erros.anotacao = 'Confira a nota.';
  if (registrado_em !== undefined && !dataValida(registrado_em)) {
    erros.registrado_em = 'Confira a data e a hora.';
  }

  if (Object.keys(erros).length) return { erros };

  return {
    valores: [
      humor,
      contextos.map((item) => item.trim()),
      titulo?.trim() || null,
      anotacao?.trim() || null,
      registrado_em ?? null,
    ],
  };
}

export function validarId(req, res, next) {
  const { id } = req.params;
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647) {
    return res.status(400).json({ mensagem: 'Identificador inválido.' });
  }
  return next();
}

function naoEncontrado(res) {
  return res.status(404).json({ mensagem: 'Registro não encontrado.' });
}

export async function listarRegistrosHumor(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT ${campos} FROM public.registros_humor
       WHERE usuario_id = $1 ORDER BY registrado_em DESC, id DESC`,
      [req.usuario.id]
    );
    return res.json({ registros: rows });
  } catch (erro) {
    return next(erro);
  }
}

export async function consultarRegistroHumor(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT ${campos} FROM public.registros_humor WHERE usuario_id = $1 AND id = $2`,
      [req.usuario.id, req.params.id]
    );
    return rows[0] ? res.json({ registro: rows[0] }) : naoEncontrado(res);
  } catch (erro) {
    return next(erro);
  }
}

export async function gravarRegistroHumor(req, res, next) {
  const { valores, erros } = lerRegistro(req.body);
  if (erros) return res.status(400).json({ mensagem: 'Confira os campos do registro.', erros });

  const id = req.params.id;
  const parametros = [req.usuario.id, ...valores];

  try {
    const resultado = id
      ? await pool.query(
        `UPDATE public.registros_humor
         SET humor = $2, contextos = $3, titulo = $4, anotacao = $5,
             registrado_em = COALESCE($6::timestamptz, registrado_em)
         WHERE usuario_id = $1 AND id = $7 RETURNING ${campos}`,
        [...parametros, id]
      )
      : await pool.query(
        `INSERT INTO public.registros_humor
           (usuario_id, humor, contextos, titulo, anotacao, registrado_em)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, CURRENT_TIMESTAMP))
         RETURNING ${campos}`,
        parametros
      );

    const registro = resultado.rows[0];
    if (!registro) return naoEncontrado(res);
    return res.status(id ? 200 : 201).json({ registro });
  } catch (erro) {
    return next(erro);
  }
}

export async function excluirRegistroHumor(req, res, next) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM public.registros_humor WHERE usuario_id = $1 AND id = $2',
      [req.usuario.id, req.params.id]
    );
    return rowCount ? res.json({ mensagem: 'Registro excluído.' }) : naoEncontrado(res);
  } catch (erro) {
    return next(erro);
  }
}