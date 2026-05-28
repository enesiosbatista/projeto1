import { Check, Loader2 } from 'lucide-react';

interface Props {
  steps: string[];
  currentStep: number;
}

export function LoadingSteps({ steps, currentStep }: Props) {
  return (
    <ul className="space-y-3">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <li
            key={i}
            className={`flex items-center gap-3 text-sm transition-colors ${
              isActive
                ? 'text-foreground'
                : isDone
                  ? 'text-zinc-500'
                  : 'text-zinc-600'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {isDone ? (
                <Check className="h-4 w-4 text-success" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-zinc-700" />
              )}
            </span>
            <span>{step}</span>
          </li>
        );
      })}
    </ul>
  );
}
