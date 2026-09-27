import {Link} from 'react-router';
import {useT} from '~/lib/i18n';

/**
 * What a visitor sees when something goes wrong — never a stack trace or a
 * blank page. 404 says the page doesn't exist; anything else says the shop
 * could not be reached and offers a way back. The technical detail goes to
 * the server log, not to the customer.
 */
export function ErrorPage({status}: {status: number}) {
  const t = useT();
  const notFound = status === 404;

  return (
    <div className="not-found">
      <p className="not-found__code">{status}</p>
      <h1>{notFound ? t('notFound.title') : t('error.title')}</h1>
      <p>{notFound ? t('notFound.text') : t('error.text')}</p>
      <div className="not-found__actions">
        <Link to="/" className="btn">
          {t('notFound.back')}
        </Link>
        <Link to="/collections/all" className="btn btn--outline">
          {t('nav.allProducts')}
        </Link>
      </div>
    </div>
  );
}
