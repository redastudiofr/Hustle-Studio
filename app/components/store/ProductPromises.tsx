import {Link} from 'react-router';
import {LEGAL} from '~/config/legal';
import {useLocalized} from '~/lib/i18n/localized';

/**
 * The short list under the product photos: what the shop commits to, from
 * app/config/legal.ts (the same figures as the legal pages).
 */
export function ProductPromises() {
  const l = useLocalized();
  const items = [
    {
      icon: (
        <path d="M2 6h11v9H2zM13 9h4l3 3v3h-7zM6 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      ),
      text: l({en: 'Tracked shipping', fr: 'Livraison suivie'}),
      to: '/legal/shipping',
    },
    {
      icon: <path d="M4 10a7 7 0 1 1 2 5M4 4v6h6" />,
      text: l({
        en: `${LEGAL.returnDays}-day returns`,
        fr: `Retours sous ${LEGAL.returnDays} jours`,
      }),
      to: '/legal/returns',
    },
    {
      icon: <path d="M6 10V7a5 5 0 0110 0v3M5 10h12v10H5zM11 14v3" />,
      text: l({en: 'Secure payment', fr: 'Paiement sécurisé'}),
    },
  ];
  return (
    <ul className="st-promises">
      {items.map((item) => (
        <li key={item.text}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 22 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {item.icon}
          </svg>
          {item.to ? <Link to={item.to}>{item.text}</Link> : item.text}
        </li>
      ))}
    </ul>
  );
}
