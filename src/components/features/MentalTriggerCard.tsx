import type { MentalTrigger } from '@/types/database';

export function MentalTriggerCard({ trigger }: { trigger: MentalTrigger }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-primary">{trigger.name}</h4>
        <span className="rounded bg-zinc-700 px-2 py-0.5 font-mono text-xs text-zinc-200">
          {trigger.timestamp}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-400">{trigger.description}</p>
    </div>
  );
}
