const doisDigitos = (numero) => String(numero).padStart(2, '0');

export function dataCurta(data) {
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${String(data.getFullYear()).padStart(4, '0')}`;
}

export function horaCurta(data) {
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

export function momentoLocal(iso) {
  const data = new Date(iso);
  return `${dataCurta(data)} · ${horaCurta(data)}`;
}

export function lerHorario(valor) {
  const partes = /^(\d{2}):(\d{2})$/.exec(valor.trim());
  if (!partes) return null;
  const [, hora, minuto] = partes.map(Number);
  return hora <= 23 && minuto <= 59 ? { hora, minuto } : null;
}

export function lerDataHora(valor, horario) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor.trim());
  const hora = lerHorario(horario);
  if (!partes || !hora) return null;

  const [, dia, mes, ano] = partes.map(Number);
  const data = new Date();
  data.setFullYear(ano, mes - 1, dia);
  data.setHours(hora.hora, hora.minuto, 0, 0);

  if (ano < 1 || data.getFullYear() !== ano || data.getMonth() !== mes - 1 ||
      data.getDate() !== dia || data.getHours() !== hora.hora || data.getMinutes() !== hora.minuto) {
    return null;
  }

  return data.toISOString();
}

export function registrosDoMes(registros, mes) {
  return registros.filter(({ registrado_em }) => {
    const data = new Date(registrado_em);
    return data.getFullYear() === mes.getFullYear() && data.getMonth() === mes.getMonth();
  });
}