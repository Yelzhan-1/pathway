// src/app/(app)/layout.tsx — shared shell for signed-in pages.
import type { ReactNode } from 'react';
import { AppShellWithRoute } from './AppShellWithRoute';
import type { ShellData } from '@/types/pathway';
import { DEFAULT_NAV } from '@/components/pathway/shell/nav';
// import { getCurrentUser } from '@/lib/auth';      ← your auth
// import { countFavorites } from '@/lib/db/favorites'; ← block 3

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = { name: 'Имя Фамилия', city: null as string | null }; // TODO: await getCurrentUser()
  const shell: ShellData = {
    user,
    nav: DEFAULT_NAV, // add badge counts when favorites exist (block 3): nav.map(n => n.id === 'favorites' ? { ...n, badge } : n)
    mobileTabs: ['home', 'unis', 'roadmap', 'ai', 'profile'],
    streakDays: null,  // block 4 → hides the chip until streaks exist
    notifications: 0,
    guide: { title: 'С чего начать?', text: '3 шага на 5 минут', cta: 'Пройти гид', href: '/onboarding' },
  };
  return <AppShellWithRoute data={shell}>{children}</AppShellWithRoute>;
}
