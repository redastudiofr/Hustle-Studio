import type {CSSProperties} from 'react';
import {Link} from 'react-router';
import {useLocalized} from '~/lib/i18n/localized';
import {HOME, type Polaroid} from '~/config/homeTemplate';
import {BRAND} from '~/config/brand';
import {SectionHeading, fill} from '~/components/pdp/shared';

/** "@account" from an Instagram URL or handle; '' when none is set. */
function instagramAccount(value: string) {
  const handle = value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/^@/, '');
  return handle ? `@${handle}` : '';
}

function instagramUrl(value: string) {
  const account = instagramAccount(value);
  if (!account) return '';
  return /^https?:\/\//.test(value.trim())
    ? value.trim()
    : `https://www.instagram.com/${account.slice(1)}/`;
}

/** Tilt of each polaroid, in turn (degrees). */
const TILTS = [-4, 2.5, -1.5, 3.5, -3];

/**
 * Homepage mock-up 04 — "worn by you": beige background, up to five
 * slightly tilted polaroids with handwritten captions (Caveat), two buttons.
 * Real customer photos only (HOME.community.photos), so the section is not
 * rendered while that list is empty.
 */
export function Community({photos}: {photos: Polaroid[]}) {
  const l = useLocalized();
  if (!photos.length) return null;
  const account = instagramAccount(BRAND.social.instagram);
  const url = instagramUrl(BRAND.social.instagram);

  return (
    <section className="hx-section hx-community" aria-labelledby="hx-community">
      <SectionHeading
        id="hx-community"
        eyebrow={HOME.community.eyebrow}
        black={HOME.community.title.black}
        blue={HOME.community.title.blue}
      />
      {account && (
        <p className="pdpx-sub">{fill(l(HOME.community.text), {account})}</p>
      )}
      <ul className="hx-polaroids">
        {photos.slice(0, 5).map((photo, index) => (
          <li
            key={photo.src}
            className="hx-polaroid"
            style={
              {'--tilt': `${TILTS[index % TILTS.length]}deg`} as CSSProperties
            }
          >
            <img
              src={photo.src}
              alt={l(photo.caption)}
              loading="lazy"
              decoding="async"
              width={400}
              height={400}
            />
            <span className="hx-polaroid__caption">{l(photo.caption)}</span>
          </li>
        ))}
      </ul>
      <div className="hx-actions">
        <Link to={HOME.community.sendTo} className="hx-button" data-tone="blue">
          {l(HOME.community.send)}
        </Link>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="hx-button"
            data-tone="outline"
          >
            {l(HOME.community.instagram)}
          </a>
        )}
      </div>
    </section>
  );
}
