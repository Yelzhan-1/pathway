'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppShell } from '@/components/pathway/shell/AppShell';
import type { ShellData } from '@/types/pathway';

export function AppShellWithRoute({
  data,
  userId,
  children,
}: {
  data: ShellData;
  userId: string;
  children: ReactNode;
}) {
  const path = usePathname();
  // '' (no match) covers routes outside the nav list, e.g. /profile and /impact —
  // reachable from the account menu — so we never wrongly highlight «Главная».
  const active = data.nav.find((item) => path === item.href || path.startsWith(`${item.href}/`))?.id ?? '';
  return (
    <AppShell data={data} active={active} userId={userId}>
      {children}
    </AppShell>
  );
}
