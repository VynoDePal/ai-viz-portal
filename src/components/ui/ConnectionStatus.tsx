"use client";

interface ConnectionStatusProps {
  isConnected: boolean;
  error?: Error | null;
  onReconnect?: () => void;
}

export function ConnectionStatus({ isConnected, error, onReconnect }: ConnectionStatusProps) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
        <span>Connected</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full" />
        <span>Connection Error</span>
        {onReconnect && (
          <button
            onClick={onReconnect}
            className="ml-2 text-xs underline hover:text-red-800 dark:hover:text-red-300"
          >
            Reconnect
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
      <div className="w-2 h-2 bg-yellow-600 dark:bg-yellow-400 rounded-full" />
      <span>Connecting...</span>
    </div>
  );
}
