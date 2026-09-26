import { MapScenery } from "@/components/pathway/dashboard/ProgressRoad";
import { Logo } from "@/components/pathway/ui/tropa";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
      <div className="flex flex-col justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          <main className="mt-8">{children}</main>
        </div>
      </div>
      <div className="relative hidden overflow-hidden lg:block">
        <MapScenery />
        <p className="absolute bottom-10 left-10 max-w-xs font-display text-[28px] font-bold leading-tight text-foreground">
          Твоя тропа
          <span className="mt-2 block font-hand text-[26px] font-semibold text-honey-deep">ты здесь</span>
        </p>
      </div>
    </div>
  );
}
