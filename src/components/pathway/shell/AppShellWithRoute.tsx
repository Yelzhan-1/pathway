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
  const active = data.nav.find((item) => path === item.href || path.startsWith(`${item.href}/`))?.id ?? 'home';
  return (
    <AppShell data={data} active={active} userId={userId}>
      {children}
    </AppShell>
  );
}
