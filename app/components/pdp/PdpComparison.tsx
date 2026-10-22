import {useLocalized} from '~/lib/i18n/localized';
import {PDP} from '~/config/productTemplate';
import {BRAND} from '~/config/brand';
import {CheckIcon, CrossIcon, SectionHeading} from '~/components/pdp/shared';

/** Mock-up 08 — two-column comparison table, ticks and crosses. */
export function PdpComparison() {
  const l = useLocalized();

  return (
    <section
      className="pdpx-section pdpx-section--alt pdpx-compare"
      aria-labelledby="pdpx-compare"
    >
      <SectionHeading
        id="pdpx-compare"
        eyebrow={PDP.comparison.eyebrow}
        black={PDP.comparison.title.black}
        blue={PDP.comparison.title.blue}
      />
      <div className="pdpx-compare__table-wrap">
        <table className="pdpx-compare__table">
          <thead>
            <tr>
              <th scope="col">{l(PDP.comparison.criterion)}</th>
              <th scope="col">
                <span className="pdpx-compare__brand">
                  {BRAND.name.trim().toUpperCase()}
                </span>
              </th>
              <th scope="col">{l(PDP.comparison.other)}</th>
            </tr>
          </thead>
          <tbody>
            {PDP.comparison.rows.map((row) => (
              <tr key={l(row.label)}>
                <th scope="row">{l(row.label)}</th>
                <td className="pdpx-compare__ours">
                  <CheckIcon />
                  <span>{l(row.ours)}</span>
                </td>
                <td className="pdpx-compare__theirs">
                  <CrossIcon />
                  <span>{l(row.theirs)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
