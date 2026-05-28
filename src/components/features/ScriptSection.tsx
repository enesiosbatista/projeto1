interface Props {
  emoji: string;
  title: string;
  text: string;
  color: 'amber' | 'violet' | 'cyan';
}

const colorMap = {
  amber: 'border-amber-500 bg-amber-950/20',
  violet: 'border-primary bg-primary/10',
  cyan: 'border-secondary bg-secondary/10',
};

export function ScriptSection({ emoji, title, text, color }: Props) {
  return (
    <div className={`rounded-xl border-l-4 p-4 ${colorMap[color]}`}>
      <h3 className="mb-2 font-semibold text-white">
        {emoji} {title}
      </h3>
      <div className="space-y-2 text-sm text-zinc-300">
        {text.split('\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
