import type {Highlight} from '~/config/productPage';

/** Line icons for the product page (20px, currentColor). */
export function PdpIcon({name}: {name: Highlight['icon'] | 'ruler' | 'check'}) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'pin':
      return (
        <svg {...common}>
          <path d="M10 17.5s5.5-5.1 5.5-9.25a5.5 5.5 0 1 0-11 0C4.5 12.4 10 17.5 10 17.5Z" />
          <circle cx="10" cy="8.25" r="2" />
        </svg>
      );
    case 'box':
      return (
        <svg {...common}>
          <path d="M10 2.5 16.5 6v8L10 17.5 3.5 14V6L10 2.5Z" />
          <path d="M3.5 6 10 9.5 16.5 6M10 9.5v8" />
        </svg>
      );
    case 'return':
      return (
        <svg {...common}>
          <path d="M4.5 8.25A6 6 0 1 1 4.6 12" />
          <path d="M1.9 5.1v3.4h3.4" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="4" y="8.5" width="12" height="8.5" rx="1.5" />
          <path d="M6.75 8.5V6.25a3.25 3.25 0 0 1 6.5 0V8.5" />
        </svg>
      );
    case 'needle':
      return (
        <svg {...common}>
          <path d="M16.5 3.5 5 15M14 3.5l2.5 2.5M3.5 16.5l1.5-1.5" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M10 2.5v15M3.5 6.25l13 7.5M3.5 13.75l13-7.5" />
        </svg>
      );
    case 'ruler':
      return (
        <svg {...common}>
          <rect x="2" y="6.5" width="16" height="7" rx="1" />
          <path d="M5.5 6.5v2.5M8.5 6.5v3.5M11.5 6.5v2.5M14.5 6.5v3.5" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common} strokeWidth={2}>
          <path d="m5.5 10.5 3 3 6-6.5" />
        </svg>
      );
  }
}
