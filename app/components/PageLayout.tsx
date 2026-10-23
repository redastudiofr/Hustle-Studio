import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {NewsletterPopup} from '~/components/NewsletterPopup';
import {Header, MobileMenu} from '~/components/Header';
import {LanguagePrompt} from '~/components/LanguagePrompt';
import {useT} from '~/lib/i18n';
import {HeaderToneProvider} from '~/lib/header-tone';

interface PageLayoutProps {
  promoSignupEnabled?: boolean;
  /** False only for a visitor who has never answered the language question. */
  localeChosen?: boolean;
  children?: React.ReactNode;
}

export function PageLayout({
  children = null,
  promoSignupEnabled = false,
  localeChosen = true,
}: PageLayoutProps) {
  const t = useT();

  // The header is sticky and in the flow (see .site-top): the page starts
  // right under it on every route, the homepage included.
  return (
    <Aside.Provider>
      <HeaderToneProvider>
        <Aside type="mobile" heading={t('nav.menu')}>
          <MobileMenu />
        </Aside>
        <Header />
        <main>{children}</main>
        <Footer />
        <NewsletterPopup enabled={promoSignupEnabled} />
        {!localeChosen && <LanguagePrompt />}
      </HeaderToneProvider>
    </Aside.Provider>
  );
}
