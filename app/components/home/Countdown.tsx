import {useEffect, useState} from 'react';

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function remainingUntil(target: number, now: number): Remaining | null {
  const diff = target - now;
  if (diff <= 0) return null;
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Days / hours / minutes / seconds left until `target`, ticking every second.
 *
 * The server cannot know the visitor's clock, so the first render shows
 * dashes and the real figures arrive right after hydration — no hydration
 * mismatch. Once the target is reached it stops for good on `endedLabel`:
 * never a negative time, never a restart.
 */
export function Countdown({
  target,
  label,
  endedLabel,
  units,
}: {
  /** Launch instant, in ms since the epoch. */
  target: number;
  label: string;
  endedLabel: string;
  units: {days: string; hours: string; minutes: string; seconds: string};
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (Date.now() >= target) return;
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= target) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const remaining = now === null ? undefined : remainingUntil(target, now);

  if (remaining === null) {
    return (
      <div className="countdown countdown--ended" role="status">
        <p className="countdown__label">{endedLabel}</p>
      </div>
    );
  }

  const cells: [string, string][] = [
    [remaining ? String(remaining.days) : '--', units.days],
    [remaining ? pad(remaining.hours) : '--', units.hours],
    [remaining ? pad(remaining.minutes) : '--', units.minutes],
    [remaining ? pad(remaining.seconds) : '--', units.seconds],
  ];

  return (
    <div className="countdown">
      <p className="countdown__label">{label}</p>
      <dl className="countdown__grid">
        {cells.map(([value, unit]) => (
          <div className="countdown__cell" key={unit}>
            <dt className="countdown__unit">{unit}</dt>
            <dd className="countdown__value">{value}</dd>
          </div>
        ))}
      </dl>
      {remaining && (
        // One announcement for screen readers, not one per second.
        <p className="sr-only">
          {remaining.days} {units.days}, {remaining.hours} {units.hours}
        </p>
      )}
    </div>
  );
}
