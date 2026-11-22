import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (erro) => {
  console.error(
    'Erro inesperado na conexão com o banco.',
    erro.code || 'ERRO_INTERNO'
  );
});

export default pool;
