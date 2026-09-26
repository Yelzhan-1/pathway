import { BarChart3, Building2, FileText, Heart, House, Leaf, ListTodo, MessagesSquare, NotebookPen, Route, Scale, Settings, Sparkles, Trophy, UserRound, type LucideIcon } from 'lucide-react';
import type { NavIcon, NavItem } from '@/types/pathway';

export const NAV_ICON: Record<NavIcon, LucideIcon> = {
  home: House,
  profile: UserRound,
  unis: Building2,
  favorites: Heart,
  compare: Scale,
  whatif: Sparkles,
  docs: FileText,
  roadmap: Route,
  tasks: ListTodo,
  opportunities: Trophy,
  exams: NotebookPen,
  ai: Leaf,
  mentors: MessagesSquare,
  impact: BarChart3,
  settings: Settings,
};

/**
 * Default IA. Routes map to the app router.
 * First 5 ids are the primary nav (sidebar top + mobile tabs, see MOBILE_TABS below);
 * the rest render in the collapsible «Ещё» group (sidebar disclosure + mobile sheet).
 * «Профиль» and «Импакт» are intentionally not listed here: profile lives in the
 * account menu (avatar), and impact is hidden from students while the route stays live.
 */
export const DEFAULT_NAV: NavItem[] = [
  { id: 'home', label: 'Главная', href: '/dashboard', icon: 'home', tone: 'forest' },
  { id: 'unis', label: 'Вузы', href: '/universities', icon: 'unis', tone: 'honey' },
  { id: 'roadmap', label: 'План', href: '/roadmap', icon: 'roadmap', tone: 'mint' },
  { id: 'docs', label: 'Документы', href: '/cv', icon: 'docs', tone: 'sky' },
  { id: 'ai', label: 'Помощник', href: '/assistant', icon: 'ai', tone: 'forest' },
  { id: 'favorites', label: 'Избранное', href: '/favorites', icon: 'favorites', tone: 'coral' },
  { id: 'compare', label: 'Сравнение', href: '/compare', icon: 'compare', tone: 'dream' },
  { id: 'whatif', label: 'Что если', href: '/what-if', icon: 'whatif', tone: 'honey' },
  { id: 'tasks', label: 'Задачи', href: '/tasks', icon: 'tasks', tone: 'sky' },
  { id: 'exams', label: 'Экзамены', href: '/exams', icon: 'exams', tone: 'dream' },
  { id: 'opportunities', label: 'Возможности', href: '/opportunities', icon: 'opportunities', tone: 'honey' },
  { id: 'mentors', label: 'Наставники', href: '/mentors', icon: 'mentors', tone: 'mint' },
];

/** Main IA: exactly these 5 (short labels) are the sidebar's top block + mobile bottom bar; everything else is «Ещё». */
export const MOBILE_TABS: { id: string; label: string }[] = [
  { id: 'home', label: 'Главная' },
  { id: 'unis', label: 'Вузы' },
  { id: 'roadmap', label: 'План' },
  { id: 'docs', label: 'Документы' },
  { id: 'ai', label: 'Помощник' },
];
