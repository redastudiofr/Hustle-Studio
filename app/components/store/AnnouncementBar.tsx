import {NAVIGATION} from '~/config/navigation';
import {useLocalized} from '~/lib/i18n/localized';

/**
 * The band above the header: the messages of app/config/navigation.ts,
 * scrolling in a loop (pure CSS; still for reduced motion).
 */
export function AnnouncementBar() {
  const l = useLocalized();
  const items = NAVIGATION.announcements.map(l);
  if (!items.length) return null;
  const row = (copy: number) => (
    <ul className="st-announce__row" aria-hidden={copy > 0 || undefined}>
      {['a', 'b'].flatMap((half) =>
        items.map((item) => <li key={`${copy}-${half}-${item}`}>{item}</li>),
      )}
    </ul>
  );
  return (
    <div className="st-announce">
      <div className="st-announce__track">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
