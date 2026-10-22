import {useId, useState} from 'react';
import {useLocalized} from '~/lib/i18n/localized';
import {PDP} from '~/config/productTemplate';
import {SectionHeading} from '~/components/pdp/shared';

/**
 * Mock-up 04 — tabs, a blue card and three tiles per tab. A tab with no
 * content written (app/config/productTemplate.ts) is not shown; with a
 * single tab left, the tab bar itself is hidden.
 */
export function PdpMaterial() {
  const l = useLocalized();
  const base = useId();
  const tabs = PDP.material.tabs.filter((tab) => l(tab.feature.title));
  const [active, setActive] = useState(0);
  if (!tabs.length) return null;
  const tab = tabs[Math.min(active, tabs.length - 1)];

  return (
    <section
      className="pdpx-section pdpx-section--alt pdpx-material"
      aria-labelledby={`${base}-title`}
    >
      <SectionHeading
        id={`${base}-title`}
        eyebrow={PDP.material.eyebrow}
        black={PDP.material.title.black}
        blue={PDP.material.title.blue}
      />

      {tabs.length > 1 && (
        <div className="pdpx-tabs" role="tablist">
          {tabs.map((candidate, index) => (
            <button
              key={l(candidate.label)}
              type="button"
              role="tab"
              id={`${base}-tab-${index}`}
              aria-selected={index === active}
              aria-controls={`${base}-panel`}
              className="pdpx-tabs__tab"
              onClick={() => setActive(index)}
            >
              {l(candidate.label)}
            </button>
          ))}
        </div>
      )}

      <div
        className="pdpx-material__panel"
        id={`${base}-panel`}
        role={tabs.length > 1 ? 'tabpanel' : undefined}
        aria-labelledby={tabs.length > 1 ? `${base}-tab-${active}` : undefined}
      >
        <div className="pdpx-feature">
          {l(tab.feature.eyebrow) && (
            <p className="pdpx-feature__eyebrow">{l(tab.feature.eyebrow)}</p>
          )}
          <h3 className="pdpx-feature__title">{l(tab.feature.title)}</h3>
          {l(tab.feature.text) && (
            <p className="pdpx-feature__text">{l(tab.feature.text)}</p>
          )}
        </div>
        {tab.tiles.length > 0 && (
          <ul className="pdpx-tiles">
            {tab.tiles.map((tile) => (
              <li key={l(tile.title)} className="pdpx-tile">
                <p className="pdpx-tile__eyebrow">{l(tile.eyebrow)}</p>
                <p className="pdpx-tile__title">{l(tile.title)}</p>
                <p className="pdpx-tile__text">{l(tile.text)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
