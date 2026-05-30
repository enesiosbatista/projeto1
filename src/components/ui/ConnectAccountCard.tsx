import { LucideIcon } from "lucide-react";

interface Props {
  platformName: string;
  isConnected: boolean;
  icon: LucideIcon;
  username?: string;
  followers?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectAccountCard({
  platformName,
  isConnected,
  icon: Icon,
  username,
  followers,
  onConnect,
  onDisconnect,
}: Props) {
  const borderColor = isConnected ? "border-green-500" : "border-zinc-800";

  return (
    <div
      className={`bg-zinc-900 border ${borderColor} rounded-xl p-5 flex flex-col justify-between h-48 transition-all`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-800">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm capitalize">{platformName}</h3>
            {isConnected && username && <p className="text-xs text-zinc-400 mt-0.5">@{username}</p>}
          </div>
        </div>

        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
            isConnected
              ? "bg-green-950/40 text-green-400 border border-green-800"
              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}
        >
          {isConnected ? "Conectado" : "Desconectado"}
        </span>
      </div>

      <div className="mt-4">
        {isConnected && followers && (
          <div className="mb-3">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Seguidores
            </span>
            <span className="font-mono text-base font-bold text-white">{followers}</span>
          </div>
        )}

        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="w-full h-9 rounded-lg bg-zinc-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900 border border-zinc-700 text-xs font-semibold text-zinc-300 transition cursor-pointer"
          >
            Desconectar
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="w-full h-9 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition cursor-pointer"
          >
            Conectar →
          </button>
        )}
      </div>
    </div>
  );
}
