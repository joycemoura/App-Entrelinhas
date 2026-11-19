import bcrypt from 'bcryptjs';

import pool from '../database/pool.js';
import { criarToken } from '../config/autenticacao.js';

const custoHash = 12;

const hashInexistente = bcrypt.hashSync(
  'conta-inexistente-entrelinhas',
  custoHash
);

const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function erroSenha(senha) {
  if (typeof senha !== 'string' || senha.length < 8) {
    return 'Use uma senha com pelo menos 8 caracteres.';
  }

  if (bcrypt.truncates(senha)) {
    return 'A senha ultrapassa 72 bytes. Reduza seu tamanho.';
  }

  return '';
}

export async function cadastrar(req, res, next) {
  const corpo = req.body || {};

  const nome =
    typeof corpo.nome === 'string'
      ? corpo.nome.trim()
      : '';

  const email =
    typeof corpo.email === 'string'
      ? corpo.email.trim().toLowerCase()
      : '';

  const senha = corpo.senha;

  const erros = {};

  if (!nome || nome.length > 80) {
    erros.nome = 'Informe seu nome ou apelido de até 80 caracteres.';
  }

  if (email.length > 255 || !emailValido.test(email)) {
    erros.email = 'Informe um e-mail válido.';
  }

  const mensagemSenha = erroSenha(senha);

  if (mensagemSenha) {
    erros.senha = mensagemSenha;
  }

  let telefone = null;

  if (corpo.telefone !== undefined && corpo.telefone !== null) {
    if (typeof corpo.telefone !== 'string') {
      erros.telefone = 'Informe o DDD e o número, ou deixe em branco.';
    } else if (corpo.telefone.trim()) {
      telefone = corpo.telefone.replace(/\D/g, '');

      const formatoValido = /^[\d\s().-]+$/.test(
        corpo.telefone
      );

      const tamanhoValido = /^\d{10,11}$/.test(telefone);

      if (!formatoValido || !tamanhoValido) {
        erros.telefone =
          'Informe o DDD e o número, ou deixe em branco.';
      }
    }
  }

  if (Object.keys(erros).length) {
    return res.status(400).json({
      mensagem: 'Confira os campos.',
      erros,
    });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, custoHash);

    const resultado = await pool.query(
      `INSERT INTO public.usuarios
         (nome, email, telefone, senha_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, telefone, criado_em`,
      [nome, email, telefone, senhaHash]
    );

    return res.status(201).json({
      mensagem: 'Conta criada.',
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({
        mensagem: 'Este e-mail já está cadastrado.',
      });
    }

    return next(erro);
  }
}

export async function entrar(req, res, next) {
  const corpo = req.body || {};

  const email =
    typeof corpo.email === 'string'
      ? corpo.email.trim().toLowerCase()
      : '';

  const senha = corpo.senha;

  if (
    email.length > 255 ||
    !emailValido.test(email) ||
    erroSenha(senha)
  ) {
    return res.status(400).json({
      mensagem:
        'Informe um e-mail válido e uma senha de 8 caracteres ou mais, limitada a 72 bytes.',
    });
  }

  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, telefone, criado_em, senha_hash
       FROM public.usuarios
       WHERE LOWER(email) = $1`,
      [email]
    );

    const usuario = resultado.rows[0];

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario?.senha_hash || hashInexistente
    );

    if (!usuario || !usuario.senha_hash || !senhaCorreta) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha incorretos.',
      });
    }

    const { senha_hash, ...usuarioPublico } = usuario;

    return res.json({
      token: criarToken(usuario.id),
      tipo: 'Bearer',
      expiraEm: 3600,
      usuario: usuarioPublico,
    });
  } catch (erro) {
    return next(erro);
  }
}

export function consultarMeuPerfil(req, res) {
  return res.json({
    usuario: req.usuario,
  });
}