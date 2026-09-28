import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Copy text to the clipboard and report success for two seconds, so a button can
 * swap to a confirmation and back.
 */
export function useCopy(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    (text: string) => {
      navigator?.clipboard?.writeText(text)
        .then(() => {
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), resetMs);
        })
        .catch(() => {
          /* clipboard denied — leave the button as-is */
        });
    },
    [resetMs]
  );

  return [copied, copy] as const;
}
