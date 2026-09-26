/**
 * Pathway B2.2 «Тропа» — data contracts. Components receive ALL content via props (no fetching inside).
 * Convention for widgets: `data: X | null` → null = empty state (render the friendly CTA, never fake numbers);
 * `loading?: true` → skeleton with the same geometry. Block tags show where the data comes from (see HANDOFF.md §6).
 */
export type Img = { src: string; width: number; height: number; blurDataURL?: string; alt: string; credit?: string };
export type CountryCode = 'KZ' | 'US' | 'DE' | 'TR' | 'KR' | 'NL' | 'GB' | 'CH' | 'JP' | 'CN' | 'SG' | 'HK' | 'AE' | 'AT' | 'CZ' | 'IT' | 'HU' | 'PL' | 'MY' | 'CA';
/** Shortlist buckets: dream = «Мечта», target = «Цель», safety = «Запасной». */
export type ChanceTier = 'safety' | 'target' | 'dream';
export type Tone = 'forest' | 'mint' | 'honey' | 'coral' | 'dream' | 'sky';

/* ---------- Shell ---------- */
export type NavIcon = 'home' | 'profile' | 'unis' | 'favorites' | 'compare' | 'whatif' | 'docs' | 'roadmap' | 'tasks' | 'opportunities' | 'exams' | 'ai' | 'mentors' | 'impact' | 'settings';
export type NavItem = { id: string; label: string; href: string; icon: NavIcon; tone: Tone; badge?: number; soon?: boolean };
export type ShellUser = { name: string; city?: string | null; email?: string };
export type ShellData = {
  user: ShellUser;
  nav: NavItem[];              // sidebar order
  mobileTabs: string[];        // 4 nav ids for the bottom bar (+ «Ещё» is added automatically) — default home, unis, roadmap, ai … see nav.ts
  streakDays: number | null;   // hide the chip when null or 0
  notifications: number;
  freeOnly: boolean;
  guide?: { title: string; text: string; cta: string; href: string } | null;
};

/* ---------- Dashboard ---------- */
export type RoadStepStatus = 'done' | 'current' | 'locked';
export type RoadStep = { id: string; title: string; status: RoadStepStatus; meta?: string; due?: string | null /* YYYY-MM-DD */; progress?: { done: number; total: number } | null; href?: string };
export type StatTile = { id: 'viewed' | 'favorites' | 'comparisons' | 'checks'; label: string; value: number; href: string };
export type MissingField = { id: string; label: string; gain: number /* % points */; href: string /* /profile#gpa */ };
export type ProfileStrength = { percent: number; levelLabel: string /* «до уровня «Готов» — 3 поля» */; missing: MissingField[] };
export type StreakData = { days: number; week: ('done' | 'today' | 'todo')[]; weekdayLabels: string[]; quest?: { title: string; done: number; total: number } | null };
export type UniCard = { id: string; name: string; monogram: string; city: string; country: string; tags: string[]; saved?: boolean; href: string };
export type ChancesSummary = { safety: number; target: number; dream: number; href: string };
export type DeadlineTicket = { id: string; title: string; date: string /* YYYY-MM-DD */; href?: string };
export type OpportunityKind = 'grant' | 'olympiad' | 'contest' | 'program';
export type Opportunity = { id: string; kind: OpportunityKind; title: string; meta: string; href: string };
export type DocStatus = 'done' | 'progress' | 'todo';
export type DocItem = { id: 'cv' | 'passport' | 'transcript' | 'motivation' | 'english' | 'recommendations' | string; title: string; status: DocStatus; meta?: string; href?: string };
export type AiBuddy = { message: string; primary: { label: string; href: string }; secondary?: { label: string; href: string } };
export type Option = { value: string; label: string; country?: CountryCode; countryKey?: string; majors?: string[] };
export type CheckChancesOptions = { programs: Option[]; countries: Option[]; universities: Option[]; defaults?: { program?: string; country?: string; university?: string } };

export type DashboardData = {
  today: string;                       // YYYY-MM-DD in the user's TZ (server)
  firstName: string;
  headline: string;                    // «Ещё 4 вуза — и откроется этап «IELTS».»
  road: RoadStep[];                    // block 2 NOW: derived from onboarding/profile; block 4 LATER: roadmap table
  roadFinish?: string | null;          // «Финиш · заявки, январь»
  stats: StatTile[] | null;            // block 3
  strength: ProfileStrength | null;    // block 2 NOW
  streak: StreakData | null;           // block 4
  popular: UniCard[] | null;           // block 3 (catalog: can list real rows from `universities` NOW)
  popularTotal?: number;
  checkOptions: CheckChancesOptions | null; // block 3 (null → locked state)
  chances: ChancesSummary | null;      // block 3
  deadlines: DeadlineTicket[] | null;  // block 4
  opportunities: Opportunity[] | null; // block 4
  docs: DocItem[] | null;              // block 2 NOW (CV status + profile-derived list)
  ai: AiBuddy | null;                  // block 5
  weeklyGoal?: number | null;
  progress?: {
    readinessPercent: number | null;
    parts: { key: string; label: string; percent: number | null }[];
    achievements: { id: string; title: string; unlocked: boolean }[];
    weeklyGoal: { goal: number | null; due: number; done: number };
  } | null;
  isExample?: boolean;                 // shows the «пример данных» chip (fixtures only)
};

/* ---------- Onboarding (real 10-step flow + summary) ---------- */
export type OnboardingIcon = 'school' | 'grad' | 'work' | 'city' | 'book' | 'star' | 'globe' | 'wallet' | 'calendar' | 'lang' | 'exam' | 'code' | 'heart' | 'flask' | 'chart' | 'palette';
export type OnboardingOption = { id: string; label: string; hint?: string; icon?: OnboardingIcon; country?: CountryCode };
export type OnboardingStep = {
  id: 'status' | 'city' | 'program' | 'gpa' | 'major' | 'english' | 'exams' | 'countries' | 'budget' | 'intake' | 'summary';
  nav: string;                 // short label under the road node
  question: string; hint?: string;
  kind: 'single' | 'multi' | 'number' | 'summary';
  options?: OnboardingOption[];
  number?: { min: number; max: number; step: number; suffix?: string; placeholder?: string };
  note?: { optionId: string; text: string } | null; // Caveat hand note next to an option (≤ 4 words, no ₸/→)
};
export type OnboardingData = { title: string; duration: string; steps: OnboardingStep[] };
export type OnboardingAnswers = Record<string, string | string[]>;

/* ---------- Profile ---------- */
export type ProfileField = { id: string; label: string; value: string | null; hint?: string; gain?: number };
export type ProfileSection = { id: string; title: string; icon: NavIcon; tone: Tone; fields: ProfileField[] };
export type ProfileData = { name: string; city: string | null; meta: string | null; email: string; strength: ProfileStrength; sections: ProfileSection[]; cv: { status: 'none' | 'draft' | 'ready'; percent: number; updated?: string | null } };

/* ---------- CV ---------- */
export type CvEntry = { id: string; title: string; org: string; period: string; bullets: string[] };
export type CvData = {
  person: { name: string; headline: string; city: string; email: string; phone?: string; links?: string[] };
  summary: string;
  education: CvEntry[];
  experience: CvEntry[];
  achievements: string[];
  skills: string[];
  languages: { name: string; level: string }[];
  completeness: number;
};

/* ---------- Landing / auth ---------- */
export type LandingData = { kicker: string; title: [string, string]; lead: string; cta: string; secondary: string; bullets: string[]; photo: Img };
