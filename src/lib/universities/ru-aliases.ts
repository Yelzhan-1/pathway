/**
 * Russian names for every catalog university. Matching is case-insensitive and
 * tolerates common case endings («в Гарварде», «Оксфорда», «Университета»).
 * Short forms (НУ, ЕНУ, СДУ) match only as a whole word.
 */
export const RU_UNIVERSITY_ALIASES: Record<string, readonly string[]> = {
  amherst: ["амхерст", "амхерст колледж"],
  "astana-it-university": ["aitu", "муит", "астана it"],
  bilkent: ["билкент"],
  bowdoin: ["боудин", "боудоин"],
  cambridge: ["кембридж", "кембриджский университет"],
  ceu: ["цеу", "центрально-европейский университет"],
  "charles-university": ["карлов", "карлов университет"],
  columbia: ["колумбийский университет"],
  dartmouth: ["дартмут", "дартмутский колледж"],
  duke: ["дьюк", "дюк"],
  "enu-gumilyov": ["ену", "гумилев", "евразийский национальный университет"],
  "eth-zurich": ["eth", "етн", "цюрих", "eth цюрих", "етн цюрих"],
  harvard: ["гарвард", "гарвардский университет"],
  hkust: ["гонконгский университет науки и технологий"],
  imperial: ["имперский колледж", "империал"],
  kaist: ["каист"],
  "kaznu-al-farabi": ["казну", "аль-фараби", "казахский национальный университет"],
  kbtu: ["кбту", "казахско-британский технический"],
  "kimep-university": ["кимэп", "kimep"],
  minerva: ["минерва"],
  mit: ["мит", "массачусетский технологический"],
  "nazarbayev-university": ["ну", "nu", "назарбаев", "назарбаев университет"],
  nus: ["нус", "национальный университет сингапура"],
  "nyu-abu-dhabi": ["nyu", "нью-йоркский университет абу-даби"],
  oxford: ["оксфорд", "оксфордский университет"],
  princeton: ["принстон", "принстонский университет"],
  "satbayev-university": ["сатпаев", "университет сатпаев"],
  "sdu-university": ["сду", "sdu", "сулейман демирель"],
  stanford: ["стэнфорд", "стенфорд", "стэнфордский университет"],
  tsinghua: ["цинхуа"],
  "tu-delft": ["делфт", "delft", "ту делфт"],
  tum: ["тум", "мюнхенский технический", "мюнхенский технический университет"],
  ucl: ["университетский колледж лондона"],
  "utokyo-college-of-design": ["utokyo", "токийский университет"],
  yale: ["йель", "йельский университет"],
};

const VOWEL_TAIL = /^[аеиоуыэюя]{1,3}$/;
const ADJECTIVE_TAIL = /^(?:ск|н)$/;
const ENDING =
  /(?:иями|ами|ями|ого|его|ому|ему|ыми|ими|ах|ях|ов|ев|ей|ий|ый|ая|яя|ое|ее|ые|ие|ом|ем|ой|ую|юю|ам|ям|[аяуюеыио])$/u;

function fold(value: string): string {
  return value.trim().toLocaleLowerCase("ru").replaceAll("ё", "е");
}

function tokens(value: string): string[] {
  return fold(value)
    .split(/[^a-zа-я0-9]+/i)
    .filter((token) => token.length > 0);
}

function stem(token: string): string {
  if (token.length < 5) return token;
  const stripped = token.replace(ENDING, "");
  return stripped.length >= 4 ? stripped : token;
}

function tokenEquals(query: string, alias: string): boolean {
  if (query === alias) return true;
  if (alias.length >= 4 && query.startsWith(alias)) {
    const extra = query.slice(alias.length);
    if (VOWEL_TAIL.test(extra)) return true;
  }
  if (alias.length < 4 || query.length < 4) return false;
  const queryStem = stem(query);
  const aliasStem = stem(alias);
  if (queryStem === aliasStem) return true;
  return aliasStem.length >= 5 && queryStem.startsWith(aliasStem) && ADJECTIVE_TAIL.test(queryStem.slice(aliasStem.length));
}

/** True when the phrase is a Russian (or short) alias of this catalog slug. */
export function matchesRussianAlias(phrase: string, slug: string): boolean {
  const aliases = RU_UNIVERSITY_ALIASES[slug];
  if (!aliases) return false;
  const queryTokens = tokens(phrase);
  if (queryTokens.length === 0) return false;
  return aliases.some((alias) => {
    const aliasTokens = tokens(alias);
    if (aliasTokens.length !== queryTokens.length) return false;
    return aliasTokens.every((token, index) => tokenEquals(queryTokens[index] ?? "", token));
  });
}
