'use client';
// src/app/(app)/AppShellWithRoute.tsx — maps the URL to the active nav id.
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/pathway/shell/AppShell';
import type { ShellData } from '@/types/pathway';

export function AppShellWithRoute({ data, children }: { data: ShellData; children: ReactNode }) {
  const path = usePathname();
  const active = data.nav.find((n) => path === n.href || path.startsWith(n.href + '/'))?.id ?? 'home';
  return <AppShell data={data} active={active}>{children}</AppShell>;
}
