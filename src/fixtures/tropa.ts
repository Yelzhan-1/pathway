/**
 * ⚠️ EXAMPLE DATA — for /dev/states, Storybook and tests ONLY. Never import in production routes (see app-routes/dev/states: notFound() in prod).
 * Names/numbers are invented; no real users. Universities are real names shown as monograms (no logos).
 */
import type { DashboardData, ShellData, ProfileData, CvData, OnboardingData, LandingData } from '@/types/pathway';
import { DEFAULT_NAV } from '@/components/pathway/shell/nav';
import { campus } from './images';

export const exampleShell: ShellData = {
  user: { name: 'Айгерим Сейткали', city: 'Алматы', email: 'aigerim@example.com' },
  nav: DEFAULT_NAV.map((n) => (n.id === 'favorites' ? { ...n, badge: 7 } : n)),
  mobileTabs: ['home', 'unis', 'roadmap', 'docs', 'ai'],
  streakDays: 5, notifications: 2, freeOnly: false,
  guide: { title: 'С чего начать?', text: '3 шага на 5 минут', cta: 'Пройти гид', href: '/guide' },
};
export const emptyShell: ShellData = { ...exampleShell, user: { name: 'Даурен', city: null }, nav: DEFAULT_NAV, streakDays: null, notifications: 0 };

const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const exampleDashboard: DashboardData = {
  today: '2026-09-26', firstName: 'Айгерим', isExample: true,
  headline: 'Ещё 4 вуза — и откроется этап «IELTS».',
  road: [
    { id: 'profile', title: 'Профиль', status: 'done', href: '/profile' },
    { id: 'cv', title: 'Резюме', status: 'done', href: '/cv' },
    { id: 'unis', title: 'Выбери 8 вузов', status: 'current', meta: 'в избранном 4 из 8', progress: { done: 4, total: 8 }, href: '/universities' },
    { id: 'ielts', title: 'IELTS', status: 'locked', due: '2026-10-12' },
    { id: 'essay', title: 'Эссе', status: 'locked' },
  ],
  roadFinish: 'Финиш · заявки, январь',
  heroCta: { current: 'вузы', cta: 'Выбрать вузы', href: '/universities' },
  weekTasks: [
    { id: 't1', title: 'Отправить эссе в KAIST', done: false, dueDate: '2026-09-28' },
    { id: 't2', title: 'Записаться на IELTS', done: false, dueDate: '2026-10-01' },
    { id: 't3', title: 'Дособрать транскрипт', done: false, dueDate: null },
  ],
  stats: [
    { id: 'viewed', label: 'вузов просмотрено', value: 24, href: '/universities?tab=history' },
    { id: 'favorites', label: 'в избранном', value: 7, href: '/favorites' },
    { id: 'comparisons', label: 'сравнения', value: 3, href: '/compare' },
  ],
  strength: { percent: 72, levelLabel: 'до уровня «Готов» — 3 поля', missing: [
    { id: 'gpa', label: 'GPA', gain: 10, href: '/profile#gpa' }, { id: 'budget', label: 'Бюджет', gain: 10, href: '/profile#budget' }, { id: 'intake', label: 'Год поступления', gain: 8, href: '/profile#intake' },
  ] },
  streak: { days: 5, week: ['done', 'done', 'done', 'done', 'done', 'today', 'todo'], weekdayLabels: WD, quest: { title: 'квест недели', done: 3, total: 5 } },
  popular: [
    { id: 'nu', name: 'Назарбаев Университет', monogram: 'NU', city: 'Астана', country: 'KZ', tags: ['Грант', 'EN'], saved: true, href: '/universities/nu' },
    { id: 'kaist', name: 'KAIST', monogram: 'KAIST', city: 'Тэджон', country: 'KR', tags: ['Стипендия'], href: '/universities/kaist' },
    { id: 'tum', name: 'TU Munich', monogram: 'TUM', city: 'Мюнхен', country: 'DE', tags: ['EN', 'Без оплаты'], href: '/universities/tum' },
  ],
  checkOptions: {
    programs: [{ value: 'nis', label: 'НИШ' }, { value: 'kz', label: 'Госшкола' }, { value: 'ib', label: 'IB' }],
    countries: [{ value: 'KR', label: 'Корея', country: 'KR' }, { value: 'KZ', label: 'Казахстан' }, { value: 'DE', label: 'Германия' }],
    universities: [{ value: 'kaist', label: 'KAIST' }, { value: 'snu', label: 'Сеульский университет' }],
    defaults: { program: 'nis', country: 'KR', university: 'kaist' },
  },
  chances: { safety: 5, target: 4, dream: 3, href: '/chances' },
  deadlines: [
    { id: 'd1', title: 'GKS, заявка', date: '2026-09-30' },
    { id: 'd2', title: 'IELTS, регистрация', date: '2026-10-12' },
    { id: 'd3', title: 'KAIST, 1 раунд', date: '2026-10-28' },
  ],
  opportunities: [
    { id: 'o1', kind: 'grant', title: 'Global Korea Scholarship', meta: 'до 30 сентября', href: '/opportunities/gks' },
    { id: 'o2', kind: 'olympiad', title: 'Жаутыковская олимпиада', meta: 'январь', href: '/opportunities/zhautykov' },
    { id: 'o3', kind: 'contest', title: 'Conrad Challenge', meta: 'до 29 октября', href: '/opportunities/conrad' },
  ],
  docs: [
    { id: 'cv', title: 'Резюме', status: 'done', href: '/cv' }, { id: 'passport', title: 'Паспорт', status: 'done' },
    { id: 'transcript', title: 'Транскрипт', status: 'progress', meta: 'в работе' }, { id: 'motivation', title: 'Мотив. письмо', status: 'progress', meta: '2 из 3' },
    { id: 'english', title: 'IELTS', status: 'todo', meta: 'октябрь' }, { id: 'recommendations', title: 'Рекомендации', status: 'todo', meta: '0 из 2' },
  ],
  ai: { message: 'GKS закрывается в среду. Заполним анкету вместе? Займёт 15 минут.', primary: { label: 'Давай', href: '/assistant?task=gks' }, secondary: { label: 'Позже', href: '#' } },
};

/** Brand-new user right after signup (before onboarding): only step 1 on the map, every widget in its empty state. */
export const emptyDashboard: DashboardData = {
  today: '2026-09-26', firstName: 'Даурен', headline: 'Начнём с профиля — это 3 минуты, и дорога откроется.',
  road: [{ id: 'profile', title: 'Заполни профиль', status: 'current', meta: '10 вопросов · 3 минуты', href: '/onboarding' }],
  roadFinish: null, stats: null, strength: null, streak: null, popular: null, checkOptions: null, chances: null, deadlines: null, opportunities: null, docs: null, ai: null,
  heroCta: { current: 'профиль', cta: 'Заполнить профиль', href: '/onboarding' }, weekTasks: null,
};

/** Real onboarding copy (10 questions + summary). Option ids map to profile enums. */
export const onboardingData: OnboardingData = {
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
export const onboardingAnswers = { status: 'g11', city: 'almaty', program: 'nis', gpa: '4.6', major: 'it', english: 'b2', exams: ['ent', 'ielts'], countries: ['KR', 'KZ'] };

export const exampleProfile: ProfileData = {
  name: 'Айгерим Сейткали', city: 'Алматы', meta: '11 класс · НИШ', email: 'aigerim@example.com',
  strength: exampleDashboard.strength!,
  cv: { status: 'draft', percent: 80, updated: 'вчера' },
  sections: [
    { id: 'study', title: 'Учёба', icon: 'exams', tone: 'mint', fields: [
      { id: 'status', label: 'Статус', value: '11 класс' }, { id: 'program', label: 'Программа', value: 'НИШ' }, { id: 'city', label: 'Город', value: 'Алматы' }, { id: 'gpa', label: 'Средний балл (GPA)', value: null, hint: 'Нужен для расчёта шансов', gain: 10 } ] },
    { id: 'goals', title: 'Цели', icon: 'roadmap', tone: 'honey', fields: [
      { id: 'major', label: 'Направление', value: 'IT и программирование' }, { id: 'countries', label: 'Страны', value: 'Южная Корея, Казахстан' }, { id: 'intake', label: 'Год поступления', value: null, hint: 'Построим план по месяцам', gain: 8 } ] },
    { id: 'lang', title: 'Язык и экзамены', icon: 'ai', tone: 'sky', fields: [
      { id: 'english', label: 'Английский', value: 'Уверенный · B2' }, { id: 'exams', label: 'Экзамены', value: 'ЕНТ, IELTS (план)' } ] },
    { id: 'money', title: 'Бюджет', icon: 'opportunities', tone: 'coral', fields: [
      { id: 'budget', label: 'Бюджет в год', value: null, hint: 'Подберём гранты под бюджет', gain: 10 } ] },
  ],
};

export const exampleCv: CvData = {
  person: { name: 'Айгерим Сейткали', headline: 'Ученица 11 класса · интересуюсь Computer Science', city: 'Алматы, Казахстан', email: 'aigerim@example.com', phone: '+7 700 000 00 00', links: ['github.com/aigerim-example'] },
  summary: 'Люблю задачи на стыке математики и программирования. Два года веду школьный клуб робототехники, хочу изучать Computer Science в Корее или Казахстане.',
  education: [{ id: 'e1', title: 'Назарбаев Интеллектуальная школа', org: 'Алматы', period: '2020 — 2027', bullets: ['Физико-математическое направление', 'Средний балл 4,6 из 5'] }],
  experience: [
    { id: 'x1', title: 'Руководитель клуба робототехники', org: 'НИШ Алматы', period: '2024 — сейчас', bullets: ['Собрала команду из 12 учеников', 'Вышли в финал республиканского турнира'] },
    { id: 'x2', title: 'Волонтёр', org: 'Фонд «Дети Алматы»', period: 'лето 2025', bullets: ['Вела уроки программирования для 7–9 классов'] },
  ],
  achievements: ['Призёр городской олимпиады по информатике, 2025', 'Сертификат Harvard CS50x, 2025'],
  skills: ['Python', 'C++', 'Arduino', 'Figma', 'Публичные выступления'],
  languages: [{ name: 'Казахский', level: 'родной' }, { name: 'Русский', level: 'свободно' }, { name: 'Английский', level: 'B2' }],
  completeness: 80,
};

export const exampleLanding: LandingData = {
  kicker: 'без паники, по шагам',
  title: ['Твоя тропа', 'к поступлению'],
  lead: 'Ответь на 10 вопросов — и Pathway проложит маршрут: вузы, экзамены, документы и сроки. Шаг за шагом, без хаоса в голове.',
  cta: 'Начать бесплатно', secondary: 'Как это работает',
  bullets: ['Вузы в каталоге', 'План за 3 минуты', 'Бесплатно для школьников'],
  photo: campus.kaist,
};
