/** Russian date helpers (no external deps). */
const MON_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MON_TILE = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
export const parseISO = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
export const dayMonth = (iso: string) => { const d = parseISO(iso); return `${d.getDate()} ${MON_SHORT[d.getMonth()]}`; };
export const tileParts = (iso: string) => { const d = parseISO(iso); return { day: d.getDate(), month: MON_TILE[d.getMonth()], weekday: WD[d.getDay()] }; };
export const daysBetween = (fromISO: string, toISO: string) => Math.round((parseISO(toISO).getTime() - parseISO(fromISO).getTime()) / 86400000);
export function inDays(n: number) {
  if (n <= 0) return 'сегодня';
  if (n === 1) return 'завтра';
  const m10 = n % 10, m100 = n % 100;
  const w = m10 === 1 && m100 !== 11 ? 'день' : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'дня' : 'дней';
  return `через ${n} ${w}`;
}
export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
}
const MON_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WD_LONG = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
/** «Суббота, 26 сентября» */
export const longDate = (iso: string) => { const d = parseISO(iso); return `${WD_LONG[d.getDay()]}, ${d.getDate()} ${MON_GEN[d.getMonth()]}`; };
/** «до 30 сентября» */
export const untilDate = (iso: string) => { const d = parseISO(iso); return `до ${d.getDate()} ${MON_GEN[d.getMonth()]}`; };
/** «Айгерим Сейткали» → «АС»; one word → first 2 letters. */
export function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[1][0]).toUpperCase();
}
