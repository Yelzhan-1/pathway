// Product copy for the 10-step onboarding (+ summary). Option ids = profile enum values.
import type { OnboardingData } from '@/types/pathway';

/** Real onboarding copy (10 questions + summary). Option ids map to profile enums. */
export const ONBOARDING: OnboardingData = {
  title: 'Соберём твой профиль', duration: '≈ 3 минуты',
  steps: [
    { id: 'status', nav: 'Статус', kind: 'single', question: 'Где ты сейчас учишься?', options: [
      { id: 'g9', label: '9 класс', icon: 'school' }, { id: 'g10', label: '10 класс', icon: 'school' }, { id: 'g11', label: '11 класс', icon: 'school' }, { id: 'grad', label: 'Уже окончил(а) школу', icon: 'grad' }, { id: 'college', label: 'Колледж', icon: 'book' }, { id: 'work', label: 'Работаю', icon: 'work' } ] },
    { id: 'city', nav: 'Город', kind: 'single', question: 'Из какого ты города?', options: [
      { id: 'almaty', label: 'Алматы', icon: 'city' }, { id: 'astana', label: 'Астана', icon: 'city' }, { id: 'shymkent', label: 'Шымкент', icon: 'city' }, { id: 'other', label: 'Другой город', icon: 'city' } ] },
    { id: 'program', nav: 'Программа', kind: 'single', question: 'По какой программе ты учишься?', options: [
      { id: 'nis', label: 'НИШ', icon: 'star' }, { id: 'state', label: 'Госшкола', icon: 'school' }, { id: 'bil', label: 'БИЛ / КТЛ', icon: 'flask' }, { id: 'ib', label: 'IB / A-Level', icon: 'globe' } ] },
    { id: 'gpa', nav: 'GPA', kind: 'number', question: 'Какой у тебя средний балл?', hint: 'Примерно — можно поправить потом.', number: { min: 2, max: 5, step: 0.1, suffix: 'из 5', placeholder: '4.6' } },
    { id: 'major', nav: 'Направление', kind: 'single', question: 'Что хочешь изучать?', options: [
      { id: 'it', label: 'IT и программирование', icon: 'code' }, { id: 'eng', label: 'Инженерия', icon: 'flask' }, { id: 'biz', label: 'Бизнес и экономика', icon: 'chart' }, { id: 'med', label: 'Медицина и биология', icon: 'heart' }, { id: 'art', label: 'Дизайн и искусство', icon: 'palette' }, { id: 'unsure', label: 'Пока не знаю', icon: 'star' } ] },
    { id: 'english', nav: 'Английский', kind: 'single', question: 'Как у тебя с английским?', options: [
      { id: 'a2', label: 'Базовый', hint: 'A1–A2', icon: 'lang' }, { id: 'b1', label: 'Средний', hint: 'B1', icon: 'lang' }, { id: 'b2', label: 'Уверенный', hint: 'B2', icon: 'lang' }, { id: 'c1', label: 'Свободный', hint: 'C1+', icon: 'lang' } ] },
    { id: 'exams', nav: 'Экзамены', kind: 'multi', question: 'Какие экзамены уже сдал(а) или планируешь?', hint: 'Можно выбрать несколько.', options: [
      { id: 'ent', label: 'ЕНТ', icon: 'exam' }, { id: 'ielts', label: 'IELTS', icon: 'exam' }, { id: 'toefl', label: 'TOEFL', icon: 'exam' }, { id: 'sat', label: 'SAT', icon: 'exam' }, { id: 'none', label: 'Пока никаких', icon: 'star' } ] },
    { id: 'countries', nav: 'Страны', kind: 'multi', question: 'Где хочешь учиться?', hint: 'Выбери до 5 стран. Покажем вузы и гранты там.', note: { optionId: 'KR', text: 'так делают многие' }, options: [
      { id: 'KZ', label: 'Казахстан', country: 'KZ' }, { id: 'KR', label: 'Южная Корея', country: 'KR' }, { id: 'DE', label: 'Германия', country: 'DE' }, { id: 'TR', label: 'Турция', country: 'TR' },
      { id: 'US', label: 'США', country: 'US' }, { id: 'NL', label: 'Нидерланды', country: 'NL' }, { id: 'CZ', label: 'Чехия', country: 'CZ' }, { id: 'unsure', label: 'Пока не знаю', icon: 'globe' } ] },
    { id: 'budget', nav: 'Бюджет', kind: 'single', question: 'Какой бюджет на учёбу в год?', hint: 'Без проживания. Гранты учтём отдельно.', options: [
      { id: 'grant', label: 'Только грант', icon: 'star' }, { id: 'lt3', label: 'До 1,5 млн ₸', icon: 'wallet' }, { id: 'lt5', label: '1,5–5 млн ₸', icon: 'wallet' }, { id: 'gt5', label: 'Больше 5 млн ₸', icon: 'wallet' } ] },
    { id: 'intake', nav: 'Год', kind: 'single', question: 'Когда хочешь поступать?', options: [
      { id: '2027', label: '2027', icon: 'calendar' }, { id: '2028', label: '2028', icon: 'calendar' }, { id: '2029', label: '2029 и позже', icon: 'calendar' }, { id: 'unsure', label: 'Пока не решил(а)', icon: 'star' } ] },
    { id: 'summary', nav: 'Итог', kind: 'summary', question: 'Проверь, всё ли верно', hint: 'Любой ответ можно поменять — и сейчас, и потом в профиле.' },
  ],
};
