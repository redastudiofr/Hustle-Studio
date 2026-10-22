import {useLocalized} from '~/lib/i18n/localized';
import {PDP} from '~/config/productTemplate';

/** Mock-up 06 — the blue rounded block with three numbered points. */
export function PdpManifesto() {
  const l = useLocalized();

  return (
    <section
      className="pdpx-section pdpx-manifesto-wrap"
      aria-labelledby="pdpx-manifesto"
    >
      <div className="pdpx-manifesto">
        <p className="pdpx-eyebrow pdpx-eyebrow--light">
          {l(PDP.manifesto.eyebrow)}
        </p>
        <h2 className="pdpx-manifesto__title" id="pdpx-manifesto">
          {l(PDP.manifesto.title)}
        </h2>
        <p className="pdpx-manifesto__text">{l(PDP.manifesto.text)}</p>
        <ol className="pdpx-manifesto__points">
          {PDP.manifesto.points.map((point, index) => (
            <li key={l(point.title)} className="pdpx-point">
              <span className="pdpx-point__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="pdpx-point__title">{l(point.title)}</h3>
                {l(point.text) && (
                  <p className="pdpx-point__text">{l(point.text)}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
