import { useEffect, useState } from "react";
import {
  getFirebaseApp,
  getFirebaseAuth,
  isFirebaseConfigured,
} from "@/services/shared/firebase";

type Status =
  | { kind: "loading" }
  | { kind: "missing_env" }
  | { kind: "ok"; projectId: string }
  | { kind: "error"; message: string };

/**
 * Jednokratno testira inicijalizaciju Firebase SDK-a (app + auth).
 * Za UI samo u developmentu — npr. banner na Home.
 */
export function useFirebaseStatus(): Status {
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setStatus({ kind: "missing_env" });
      return;
    }
    try {
      const app = getFirebaseApp();
      getFirebaseAuth();
      const projectId = app.options.projectId ?? "?";
      setStatus({ kind: "ok", projectId });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setStatus({ kind: "error", message });
    }
  }, []);

  return status;
}
