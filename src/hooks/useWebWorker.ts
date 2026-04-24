import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebWorkerOptions<T, R> {
  workerFn: (data: T) => R;
  onMessage?: (result: R) => void;
  onError?: (error: Error) => void;
}

interface UseWebWorkerReturn<T, R> {
  execute: (data: T) => Promise<R>;
  isProcessing: boolean;
  error: Error | null;
  terminate: () => void;
}

export function useWebWorker<T, R>({
  workerFn,
  onMessage,
  onError,
}: UseWebWorkerOptions<T, R>): UseWebWorkerReturn<T, R> {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((value: R) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  const execute = useCallback(
    (data: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        setIsProcessing(true);
        setError(null);
        resolveRef.current = resolve;
        rejectRef.current = reject;

        try {
          // Create a blob URL for the worker function
          const workerCode = `
            self.onmessage = function(e) {
              try {
                const result = (${workerFn.toString()})(e.data);
                self.postMessage({ success: true, result });
              } catch (error) {
                self.postMessage({ success: false, error: error.message });
              }
            };
          `;
          const blob = new Blob([workerCode], { type: "application/javascript" });
          const workerUrl = URL.createObjectURL(blob);

          const worker = new Worker(workerUrl);

          worker.onmessage = (e) => {
            if (e.data.success) {
              if (onMessage) {
                onMessage(e.data.result);
              }
              if (resolveRef.current) {
                resolveRef.current(e.data.result);
              }
            } else {
              const error = new Error(e.data.error);
              if (onError) {
                onError(error);
              }
              if (rejectRef.current) {
                rejectRef.current(error);
              }
              setError(error);
            }
            setIsProcessing(false);
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
          };

          worker.onerror = (e) => {
            const error = new Error(e.message || "Worker error");
            if (onError) {
              onError(error);
            }
            if (rejectRef.current) {
              rejectRef.current(error);
            }
            setError(error);
            setIsProcessing(false);
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
          };

          workerRef.current = worker;
          worker.postMessage(data);
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          if (onError) {
            onError(error);
          }
          if (rejectRef.current) {
            rejectRef.current(error);
          }
          setError(error);
          setIsProcessing(false);
        }
      });
    },
    [workerFn, onMessage, onError]
  );

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    return () => {
      terminate();
    };
  }, [terminate]);

  return {
    execute,
    isProcessing,
    error,
    terminate,
  };
}
