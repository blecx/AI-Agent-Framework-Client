import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ConnectionState } from "../types/connection";
import "./ConnectionBanner.css";

interface ConnectionBannerProps {
  state: ConnectionState;
  onRetry: () => void;
}

export default function ConnectionBanner({
  state,
  onRetry,
}: ConnectionBannerProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (state === "online") {
      const timeoutId = window.setTimeout(() => {
        setDismissed(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [state]);

  const bannerKey = useMemo(() => {
    if (state === "offline") {
      return "banner.offline";
    }

    return "banner.degraded";
  }, [state]);

  if (dismissed || state === "online") {
    return null;
  }

  return (
    <div
      className={`connection-banner connection-banner--${state}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="connection-banner__icon" aria-hidden="true">
        ⚠️
      </span>
      <p className="connection-banner__message">{t(bannerKey)}</p>
      <div className="connection-banner__actions">
        <button
          type="button"
          className="connection-banner__button connection-banner__button--secondary"
          onClick={() => setDismissed(true)}
        >
          {t("conn.action.workOffline")}
        </button>
        <button
          type="button"
          className="connection-banner__button connection-banner__button--primary"
          onClick={onRetry}
        >
          {t("conn.action.retry")}
        </button>
      </div>
    </div>
  );
}
