import { getExamCodeLabel } from "@/lib/profile/labels";
import { strings } from "@/lib/strings";

const INTERNAL_NOTE =
  /scanned\s+pdf|price\s+list|spreadsheet|internal\s+note|todo\b|fixme\b|see\s+the\s+attached|published as a scanned/i;

const ROUND_LABELS: Record<string, string> = {
  rd: "Основной",
  regular: "Основной",
  "regular decision": "Основной",
  main: "Основной",
  ea: "Ранний",
  early: "Ранний",
  "early action": "Ранний",
  ed: "Раннее решение",
  "early decision": "Раннее решение",
  rolling: "Скользящий",
  "rolling admission": "Скользящий",
  rea: "Ограниченный ранний приём",
  "restrictive early action": "Ограниченный ранний приём",
  scea: "Единственный ранний приём",
  "single-choice early action": "Единственный ранний приём",
  "single choice early action": "Единственный ранний приём",
  ra: "Основной",
};

const AID_LABELS: Record<string, string> = {
  need_blind: "Без учёта дохода",
  need_aware: "С учётом дохода",
  merit: "За успехи",
  none: "без гранта для иностранцев",
  unknown: "помощь неизвестна",
  funded: "С финансированием",
  full_ride: "Полное покрытие",
};

export function formatMoneyUsd(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} $`;
}

export function aidLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const key = value.trim().toLowerCase().replace(/\s+/g, "_");
  if (key in AID_LABELS) return AID_LABELS[key];
  if (value in strings.universities.aid) {
    return strings.universities.aid[value as keyof typeof strings.universities.aid];
  }
  if (/funded|финанс/i.test(value)) return AID_LABELS.funded;
  if (isInternalNote(value)) return null;
  return value;
}

export function roundLabel(round: string): string {
  const key = round.trim().toLowerCase().replace(/\s+/g, " ");
  return ROUND_LABELS[key] ?? round.replace(/\s*\(offered\)\s*/gi, "").trim();
}

export function isInternalNote(value: string | null | undefined): boolean {
  if (!value?.trim()) return true;
  return INTERNAL_NOTE.test(value);
}

export function publicNote(value: string | null | undefined): string | null {
  if (!value?.trim() || isInternalNote(value)) return null;
  return translatePublicNote(value.trim());
}

const MONTHS: Record<string, string> = {
  jan: "янв",
  feb: "фев",
  mar: "мар",
  apr: "апр",
  may: "мая",
  jun: "июн",
  jul: "июл",
  aug: "авг",
  sep: "сен",
  oct: "окт",
  nov: "ноя",
  dec: "дек",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Longer phrases first, so "state educational grants" is not cut into the singular. */
const CATALOG_PHRASES: [string, string][] = [
  ["Kazakhstan State Educational Grant (bachelor)", "Государственный образовательный грант Казахстана (бакалавриат)"],
  ["Nazarbayev University state educational grant", "Государственный образовательный грант Nazarbayev University"],
  ["Most Kazakhstan citizens study on the NU state educational grant", "Большинство граждан Казахстана учатся по государственному образовательному гранту NU"],
  ["Admitted international students receive the KAIST Scholarship", "Принятые иностранные студенты получают стипендию KAIST"],
  ["without Swiss residence/citizenship", "без швейцарского резидентства или гражданства"],
  ["state educational grants", "государственные образовательные гранты"],
  ["state educational grant", "государственный образовательный грант"],
  ["need-blind for all applicants regardless of citizenship", "без учёта дохода для всех абитуриентов, независимо от гражданства"],
  ["need-blind for international applicants", "без учёта дохода для иностранных абитуриентов"],
  ["need-blind for international students", "без учёта дохода для иностранных студентов"],
  ["need-blind admission", "приём без учёта дохода"],
  ["need-blind", "без учёта дохода"],
  ["meets 100% of calculated need", "покрывает 100% рассчитанной потребности"],
  ["meets 100% of demonstrated need", "покрывает 100% подтверждённой потребности"],
  ["meets full calculated need without loans", "покрывает полную рассчитанную потребность без кредитов"],
  ["meets full demonstrated need", "покрывает полную подтверждённую потребность"],
  ["100% need-based aid", "помощь на 100% по потребности"],
  ["need-based aid", "помощь по потребности"],
  ["need-based", "по потребности"],
  ["full tuition exemption", "полное освобождение от оплаты обучения"],
  ["tuition-waiver scholarships", "стипендии с освобождением от оплаты"],
  ["tuition-waiver", "освобождение от оплаты обучения"],
  ["tuition waiver", "освобождение от оплаты обучения"],
  ["full tuition", "полная стоимость обучения"],
  ["activity fee", "взнос за мероприятия"],
  ["comprehensive fee", "общий взнос"],
  ["application fee", "взнос за подачу"],
  ["enrollment fee", "взнос за зачисление"],
  ["registration fee", "регистрационный взнос"],
  ["student union fee", "взнос студенческого союза"],
  ["health insurance", "медстраховка"],
  ["cost of attendance", "полная стоимость"],
  ["billed costs", "начисляемые расходы"],
  ["total budget", "общий бюджет"],
  ["total estimated", "оценочный итог"],
  ["estimated total", "оценочный итог"],
  ["not converted to USD", "без пересчёта в доллары"],
  ["not converted", "без пересчёта"],
  ["not yet published", "ещё не опубликовано"],
  ["not yet confirmed", "ещё не подтверждено"],
  ["not yet shown", "ещё не указано"],
  ["not captured", "сумма не указана"],
  ["amount not recorded", "сумма не записана"],
  ["not recorded", "не записано"],
  ["admission offer", "предложение о зачислении"],
  ["exam scores", "баллы экзаменов"],
  ["five levels", "пять уровней"],
  ["based on", "на основе"],
  ["full tuition exemption for 8 semesters", "полное освобождение от оплаты на 8 семестров"],
  ["not verified", "не проверено"],
  ["not eligible", "не подходит"],
  ["per academic year", "за учебный год"],
  ["per year", "в год"],
  ["per semester", "за семестр"],
  ["per quarter", "за квартал"],
  ["per credit", "за кредит"],
  ["per month", "в месяц"],
  ["three terms", "три семестра"],
  ["exactly the same", "ровно ту же"],
  ["admission fee", "вступительный взнос"],
  ["activities", "мероприятия"],
  ["incl.", "включая"],
  ["computer", "компьютер"],
  ["total", "итого"],
  ["most", "большинство"],
  ["study", "учёба"],
  ["if needed", "при необходимости"],
  ["international applicants", "иностранные абитуриенты"],
  ["international students", "иностранные студенты"],
  ["international undergraduates", "иностранные студенты бакалавриата"],
  ["admitted internationals", "принятые иностранцы"],
  ["Kazakhstan citizens", "граждане Казахстана"],
  ["citizens of Kazakhstan", "граждане Казахстана"],
  ["regardless of citizenship", "независимо от гражданства"],
  ["who apply for aid", "которые подают на помощь"],
  ["receive aid", "получают помощь"],
  ["financial aid", "финансовая помощь"],
  ["no parent contribution", "без взноса родителей"],
  ["parent contribution", "взнос родителей"],
  ["families with income", "семьи с доходом"],
  ["typical assets", "обычные активы"],
  ["without loans", "без кредитов"],
  ["no loans", "без кредитов"],
  ["no merit scholarships", "без стипендий за заслуги"],
  ["merit scholarships", "стипендии за заслуги"],
  ["merit-based", "за заслуги"],
  ["living allowance", "стипендия на жизнь"],
  ["round trips", "поездки туда и обратно"],
  ["two round trips per year", "две поездки туда и обратно в год"],
  ["Foundation Year", "подготовительный год"],
  ["Bachelor's degree", "степень бакалавра"],
  ["bachelor's", "бакалавриат"],
  ["(bachelor)", "(бакалавриат)"],
  ["undergraduate", "бакалавриат"],
  ["Computer Science", "компьютерные науки"],
  ["Chemical Eng.", "химическая инженерия"],
  ["Engineering", "инженерия"],
  ["Mathematics", "математика"],
  ["Informatics", "информатика"],
  ["Overseas tuition", "обучение для иностранцев"],
  ["Overseas fee", "взнос для иностранцев"],
  ["Overseas students", "иностранные студенты"],
  ["Overseas", "для иностранцев"],
  ["Home fee", "взнос для местных"],
  ["Non-EU", "не из ЕС"],
  ["non-EU/EFTA", "не из ЕС/ЕАСТ"],
  ["Institutional fee", "институциональный взнос"],
  ["plus enrollment", "плюс зачисление"],
  ["housing", "проживание"],
  ["meals", "питание"],
  ["food", "питание"],
  ["books", "учебники"],
  ["personal", "личные расходы"],
  ["plus", "плюс"],
  ["tuition", "обучение"],
  ["scholarships", "стипендии"],
  ["scholarship", "стипендия"],
  ["applicants", "абитуриенты"],
  ["students", "студенты"],
  ["student", "студент"],
  ["admitted", "принятые"],
  ["citizens", "граждане"],
  ["citizenship", "гражданство"],
  ["semester", "семестр"],
  ["quarter", "квартал"],
  ["fees", "взносы"],
  ["fee", "взнос"],
  ["estimated", "оценочно"],
  ["including", "включая"],
  ["includes", "включает"],
  ["available", "доступно"],
  ["required", "обязательно"],
  ["published", "опубликовано"],
  ["official", "официальный"],
  ["international", "иностранный"],
  ["average", "средний"],
  ["annual", "годовой"],
  ["package", "пакет"],
  ["incoming", "поступающие"],
  ["transfer", "перевод"],
  ["eligible", "подходит"],
  ["limited", "ограниченно"],
  ["accommodation", "проживание"],
  ["discounts", "скидки"],
  ["benefits", "льготы"],
  ["via UNT", "через ЕНТ"],
  ["price list", "прайс-лист"],
  ["last cycle", "прошлый цикл"],
  ["verify", "проверьте"],
  ["UK time", "по времени Великобритании"],
  ["Beijing time", "по пекинскому времени"],
  ["Astana time", "по времени Астаны"],
  ["local time", "по местному времени"],
  ["financial aid deadline", "дедлайн финансовой помощи"],
  ["financial aid open", "приём заявок на помощь открыт"],
  ["financial aid closed", "приём заявок на помощь закрыт"],
  ["decisions", "решения"],
  ["application period", "период подачи"],
  ["application", "заявка"],
  ["applications", "заявки"],
  ["deadline", "дедлайн"],
  ["for entry", "для поступления"],
  ["winter-semester", "зимний семестр"],
  ["entrance exam", "вступительный экзамен"],
  ["without entrance exam", "без вступительного экзамена"],
  ["semesters", "семестров"],
  ["semester", "семестр"],
  ["receive", "получают"],
  ["amount", "сумма"],
  ["grades", "оценки"],
  ["scores", "баллы"],
  ["threefold", "тройной"],
  ["without", "без"],
  ["swiss", "швейцарское"],
  ["residence", "резидентство"],
  ["shown", "указан"],
  ["home", "для местных"],
  ["materials", "документы"],
  ["within", "в течение"],
  ["days", "дней"],
  ["admission", "приём"],
  ["from", "с"],
  ["based", "на основе"],
];

function phrasePattern(from: string): RegExp {
  const escaped = escapeRegExp(from);
  const start = /^\w/.test(from) ? "\\b" : "";
  const end = /\w$/.test(from) ? "\\b" : "";
  return new RegExp(`${start}${escaped}${end}`, "gi");
}

function translateCatalogCopy(value: string): string {
  let text = value;
  const phrases = [...CATALOG_PHRASES].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of phrases) {
    text = text.replace(phrasePattern(from), to);
  }
  const amount = "([0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]+)?)";
  return text
    .replace(new RegExp(`~USD\\s*${amount}`, "gi"), "около $1 $")
    .replace(new RegExp(`USD\\s*${amount}`, "gi"), "$1 $")
    .replace(new RegExp(`EUR\\s*${amount}`, "gi"), "$1 €")
    .replace(new RegExp(`GBP\\s*${amount}`, "gi"), "$1 £")
    .replace(new RegExp(`CHF\\s*${amount}`, "gi"), "$1 франков")
    .replace(new RegExp(`HKD\\s*${amount}`, "gi"), "$1 гонконгских долларов")
    .replace(new RegExp(`JPY\\s*${amount}`, "gi"), "$1 иен")
    .replace(new RegExp(`KRW\\s*${amount}`, "gi"), "$1 вон")
    .replace(new RegExp(`KZT\\s*${amount}`, "gi"), "$1 тенге")
    .replace(new RegExp(`CZK\\s*${amount}`, "gi"), "$1 крон")
    .replace(/\$([0-9]+)k\b/gi, "$1 тыс. $")
    .replace(new RegExp(`\\$${amount}`, "g"), "$1 $");
}

function translatePublicNote(value: string): string {
  const phrases: [RegExp, string][] = [
    [/restrictive early action/gi, "ограниченный ранний приём"],
    [/single-choice early action/gi, "единственный ранний приём"],
    [/early\s+decision/gi, "раннее решение"],
    [/early\s+action/gi, "ранняя подача"],
    [/early\s+admissions?/gi, "ранний приём"],
    [/regular\s+admissions?/gi, "основной приём"],
    [/non-binding/gi, "без обязательства"],
    [/\bbinding\b/gi, "с обязательством"],
    [/spring or fall (\d{4}) entry/gi, "поступление весной или осенью $1"],
    [/fall (\d{4}) only/gi, "только осень $1"],
    [/recommendation by/gi, "рекомендация до"],
    [/financial aid application (?:due|by)/gi, "заявка на помощь до"],
    [/test scores needed by end of november \(ideally end of october\)/gi, "баллы нужны до конца ноября (лучше до конца октября)"],
    [/tests must be taken before/gi, "тесты нужно сдать до"],
    [/english tests through january/gi, "английский — до конца января"],
    [/tests before/gi, "тесты до"],
    [/close at/gi, "заканчивается в"],
    [/\bapply\b/gi, "подача"],
    [/\bresults\b/gi, "результаты"],
    [/local time/gi, "по местному времени"],
  ];
  let text = value;
  for (const [pattern, replacement] of phrases) text = text.replace(pattern, replacement);
  text = text.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, (month) => {
    return MONTHS[month.slice(0, 3).toLowerCase()] ?? month;
  });
  text = text.replace(
    /\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*KST\b/gi,
    (_match, hour: string, minutes: string | undefined, ampm: string) => {
      let clock = Number(hour);
      const marker = ampm.toUpperCase();
      if (marker === "PM" && clock < 12) clock += 12;
      if (marker === "AM" && clock === 12) clock = 0;
      const mm = minutes ?? "00";
      return `${String(clock).padStart(2, "0")}:${mm} по времени Кореи (KST)`;
    },
  );
  return translateCatalogCopy(text);
}

/** Opportunity and catalog titles, through the same phrase path as notes. */
export function displayTitle(value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return "";
  return translatePublicNote(text);
}

function translatePaidCost(text: string): string {
  return text
    .replace(/^paid:\s*/i, "платно: ")
    .replace(
      /need-based discounts up to free incl\. travel/gi,
      "скидки по потребности вплоть до бесплатно, включая проезд",
    )
    .replace(
      /need-based aid up to full tuition for domestic and international students/gi,
      "помощь по потребности до полной стоимости обучения для своих и иностранных студентов",
    )
    .replace(/need-based aid available/gi, "есть помощь по потребности")
    .replace(/need-based scholarships/gi, "стипендии по потребности")
    .replace(
      /financial aid available \(limited travel support for internationals\)/gi,
      "есть финансовая помощь (ограниченная поддержка проезда для иностранцев)",
    )
    .replace(/financial aid available/gi, "есть финансовая помощь")
    .replace(/program fee/gi, "взнос за программу")
    .replace(/tuition/gi, "обучение")
    .replace(/max USD ([0-9,]+)/gi, "максимум $1 $")
    .replace(/up to USD ([0-9,]+)/gi, "до $1 $")
    .replace(/USD ([0-9,]+)/gi, "$1 $")
    .replace(/fees with /gi, "взносы, ")
    .replace(/Innovation Stage entry fee \(amount not captured\)/gi, "взнос этапа Innovation Stage (сумма не указана)");
}

/** Show a stored cost in Russian. Unknown wording still goes through the catalog phrase path. */
export function displayCost(cost: string | null | undefined): string | null {
  if (cost == null) return null;
  const text = cost.trim();
  if (!text) return null;
  if (/^free$/i.test(text)) return "бесплатно";
  if (/^funded$/i.test(text)) return "с финансированием";
  if (/^unknown$/i.test(text)) return "стоимость не указана";
  if (/^paid:/i.test(text)) return translatePaidCost(text);
  return translatePublicNote(text);
}

export function examLabel(code: string): string {
  return getExamCodeLabel(code);
}
