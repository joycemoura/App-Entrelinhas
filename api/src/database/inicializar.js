import { readFile } from 'node:fs/promises';
import pool from './pool.js';

try {
  const arquivo = new URL(
    '../../database/schema.sql',
    import.meta.url
  );

  const sql = await readFile(arquivo, 'utf8');

  await pool.query(sql);

  console.log('Estrutura do banco preparada.');
} catch (erro) {
  console.error(
    'Não foi possível preparar o banco.',
    erro.code || 'ERRO_INTERNO'
  );

  process.exitCode = 1;
} finally {
  await pool.end();
}