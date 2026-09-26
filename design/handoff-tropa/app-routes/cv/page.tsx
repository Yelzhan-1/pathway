// src/app/(app)/cv/page.tsx — editor + A4 preview. Printing shows ONLY .cv-print-root (see globals.css @media print).
import { CvBuilderScreen } from '@/components/pathway/cv/CvBuilderScreen';
import type { CvData } from '@/types/pathway';

export default async function CvPage() {
  const data: CvData = { // TODO: load the user's CV (prefill person/education from profile)
    person: { name: 'Имя Фамилия', headline: '', city: '', email: '' }, summary: '', education: [], experience: [], achievements: [], skills: [], languages: [], completeness: 0,
  };
  return <CvBuilderScreen data={data} done={[]} initialSection="person" />;
}
