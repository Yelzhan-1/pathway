import { Building2, FileText, Heart, House, Leaf, NotebookPen, Route, Scale, Settings, Trophy, UserRound, type LucideIcon } from 'lucide-react';
import type { NavIcon, NavItem } from '@/types/pathway';

export const NAV_ICON: Record<NavIcon, LucideIcon> = { home: House, profile: UserRound, unis: Building2, favorites: Heart, compare: Scale, docs: FileText, roadmap: Route, opportunities: Trophy, exams: NotebookPen, ai: Leaf, settings: Settings };

/** Default IA. Routes are suggestions — map to your app router. `soon` = feature from a later block (shows «скоро», still navigable to a stub). */
export const DEFAULT_NAV: NavItem[] = [
  { id: 'home', label: 'Главная', href: '/dashboard', icon: 'home', tone: 'forest' },
  { id: 'profile', label: 'Профиль', href: '/profile', icon: 'profile', tone: 'mint' },
  { id: 'unis', label: 'Вузы', href: '/universities', icon: 'unis', tone: 'honey' },
  { id: 'favorites', label: 'Избранное', href: '/favorites', icon: 'favorites', tone: 'coral' },
  { id: 'compare', label: 'Сравнение', href: '/compare', icon: 'compare', tone: 'dream' },
  { id: 'docs', label: 'Резюме и документы', href: '/cv', icon: 'docs', tone: 'sky' },
  { id: 'roadmap', label: 'Дорожная карта', href: '/roadmap', icon: 'roadmap', tone: 'mint' },
  { id: 'opportunities', label: 'Возможности', href: '/opportunities', icon: 'opportunities', tone: 'honey' },
  { id: 'exams', label: 'Экзамены', href: '/exams', icon: 'exams', tone: 'dream' },
  { id: 'ai', label: 'AI-помощник', href: '/assistant', icon: 'ai', tone: 'forest' },
];
/** Mobile bottom bar: exactly these 5 (short labels) + «Ещё» (sheet with the rest). */
export const MOBILE_TABS: { id: string; label: string }[] = [
  { id: 'home', label: 'Главная' }, { id: 'unis', label: 'Вузы' }, { id: 'roadmap', label: 'План' }, { id: 'ai', label: 'AI' }, { id: 'profile', label: 'Профиль' },
];
