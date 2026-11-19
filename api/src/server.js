import 'dotenv/config';

import app from './app.js';

const porta = Number(process.env.PORT || 3000);

app.listen(porta, '0.0.0.0', () => {
  console.log(
    `API do Entrelinhas: http://localhost:${porta}`
  );
});