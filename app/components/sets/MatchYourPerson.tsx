import {Link} from 'react-router';
import {MATCH_PHOTOS, SETS_BUNDLE} from '~/config/sets';
import {isLive} from '~/config/promotions';
import {useT} from '~/lib/i18n';

/**
 * "Match your person": two photos of the sets worn side by side, and a panel
 * that sends to the sets. The two-set price is only stated once the Shopify
 * code behind it exists (SETS_BUNDLE); no shipping promise is made here.
 */
export function MatchYourPerson() {
  const t = useT();
  const bundleLive = isLive(SETS_BUNDLE);
  return (
    <section className="hs-match" aria-labelledby="hs-match-title">
      <div className="hs-match__photos">
        {MATCH_PHOTOS.map((photo) => (
          <Link
            key={photo.src}
            to={photo.href}
            prefetch="intent"
            className="hs-match__photo"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
            />
            <span className="hs-match__label">{photo.label}</span>
          </Link>
        ))}
      </div>
      <div className="hs-match__panel">
        <p className="hs-match__eyebrow">{t('match.eyebrow')}</p>
        <h2 className="hs-match__title" id="hs-match-title">
          {t('match.title')}
        </h2>
        <p className="hs-match__text">
          {bundleLive
            ? t('match.textDeal', {
                count: SETS_BUNDLE.sets,
                amount: `€${SETS_BUNDLE.amount}`,
              })
            : t('match.text')}
        </p>
        <div className="hs-match__actions">
          <Link to="/sets" prefetch="intent" className="hs-match__btn">
            {t('match.shop')}
          </Link>
          <a href="#the-sets" className="hs-match__btn hs-match__btn--ghost">
            {t('match.colours')}
          </a>
        </div>
      </div>
    </section>
  );
}
