import {Link} from 'react-router';

/** Section title of the shop: centred, upper case, a rule on each side. */
export function StoreHeading({
  id,
  title,
  subtitle,
  text,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  text?: string;
}) {
  return (
    <header className="st-heading">
      <h2 className="st-heading__title" id={id}>
        <span>{title}</span>
      </h2>
      {subtitle && <p className="st-heading__subtitle">{subtitle}</p>}
      {text && <p className="st-heading__text">{text}</p>}
    </header>
  );
}

/** The black "View all" pill under a grid. */
export function ViewAll({to, label}: {to: string; label: string}) {
  return (
    <div className="st-viewall">
      <Link to={to} prefetch="intent" className="st-pill st-pill--dark">
        {label}
      </Link>
    </div>
  );
}
