import 'dotenv/config';
import jwt from 'jsonwebtoken';

const segredo = process.env.JWT_SECRET;

if (!segredo || !/^[a-f0-9]{64}$/i.test(segredo)) {
  throw new Error(
    'Configure JWT_SECRET no .env da API com 64 caracteres hexadecimais aleatórios.'
  );
}

const chave = Buffer.from(segredo, 'hex');

const emissor = 'entrelinhas-api';
const destinatario = 'entrelinhas-mobile';

export function criarToken(id) {
  return jwt.sign({}, chave, {
    algorithm: 'HS256',
    subject: String(id),
    issuer: emissor,
    audience: destinatario,
    expiresIn: '1h',
  });
}

export function verificarToken(token) {
  return jwt.verify(token, chave, {
    algorithms: ['HS256'],
    issuer: emissor,
    audience: destinatario,
    maxAge: '1h',
  });
}