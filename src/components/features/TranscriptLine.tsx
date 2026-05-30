import type { TranscriptLine as TLine } from "@/types/database";

const styleMap: Record<TLine["type"], string> = {
  hook: "bg-amber-950/40 border-l-2 border-amber-500",
  cta: "bg-secondary/10 border-l-2 border-secondary",
  highlight: "bg-primary/10 border-l-2 border-primary",
  normal: "border-l-2 border-transparent",
};

export function TranscriptLine({ line }: { line: TLine }) {
  return (
    <div className={`flex items-start gap-3 rounded-r-md px-3 py-2 ${styleMap[line.type]}`}>
      <span className="mt-0.5 rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300">
        [{line.timestamp}]
      </span>
      <p className="text-sm text-zinc-200">{line.text}</p>
    </div>
  );
}
