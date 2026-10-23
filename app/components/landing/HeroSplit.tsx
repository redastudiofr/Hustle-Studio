import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {useLocalized} from '~/lib/i18n/localized';
import {HOME, type HeroPanel} from '~/config/homeTemplate';
import {fill} from '~/components/pdp/shared';

/**
 * Homepage mock-up 01 — two full-frame photo panels side by side, each with
 * a giant Anton title and a white button; on phones (mock-up 07) a slider
 * with dots. A panel's button shows only when it has a page to open
 * (`to`). Photos load eagerly: this is the first screen.
 */
export function HeroSplit({panels}: {panels: HeroPanel[]}) {
  const l = useLocalized();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      if (!track.clientWidth) return;
      setActive(Math.round(track.scrollLeft / track.clientWidth));
    };
    track.addEventListener('scroll', onScroll, {passive: true});
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  if (!panels.length) return null;

  return (
    <section className="hx-hero" aria-label={l(panels[0].title)}>
      <div className="hx-hero__track" ref={trackRef} data-count={panels.length}>
        {panels.map((panel, index) => {
          const subtitle =
            panel.subtitle && l(panel.subtitle).includes('{name}')
              ? HOME.sweaterName.trim()
                ? fill(l(panel.subtitle), {name: HOME.sweaterName.trim()})
                : ''
              : l(panel.subtitle);
          return (
            <article
              key={l(panel.title)}
              className="hx-hero__panel"
              data-align={index % 2 ? 'end' : 'start'}
            >
              <img
                className="hx-hero__img"
                src={panel.image}
                alt={l(panel.alt)}
                loading="eager"
                // React 18 only passes the attribute through in lower case.
                {...{fetchpriority: index === 0 ? 'high' : 'auto'}}
                decoding="async"
              />
              <div className="hx-hero__copy">
                {index === 0 ? (
                  <h1 className="hx-hero__title">{l(panel.title)}</h1>
                ) : (
                  <h2 className="hx-hero__title">{l(panel.title)}</h2>
                )}
                {subtitle && <p className="hx-hero__subtitle">{subtitle}</p>}
              </div>
              {panel.to && (
                <Link to={panel.to} prefetch="intent" className="hx-hero__cta">
                  {l(panel.cta)}
                </Link>
              )}
            </article>
          );
        })}
      </div>
      {panels.length > 1 && (
        <div className="hx-hero__dots" aria-hidden="true">
          {panels.map((panel, index) => (
            <span
              key={l(panel.title)}
              data-active={index === active || undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * The blue band of arguments, scrolling forever — pure CSS: the list is
 * written twice and the row slides by exactly one copy, so the loop has no
 * seam. Paused for visitors who ask for reduced motion.
 */
export function ScrollingBand({items}: {items: string[]}) {
  if (!items.length) return null;
  const row = (copy: number) => (
    <ul className="hx-band__row" aria-hidden={copy > 0 || undefined}>
      {items.map((item) => (
        <li key={`${copy}-${item}`}>{item}</li>
      ))}
    </ul>
  );
  return (
    <div className="hx-band">
      <div className="hx-band__track">
        {row(0)}
        {row(1)}
      </div>
    </div>
  );
}
