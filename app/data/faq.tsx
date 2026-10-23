import type {ReactNode} from 'react';
import type {Translate} from '~/lib/i18n';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

/**
 * Questions about the pieces themselves. The site sells nothing online, so
 * there is nothing here about orders, payment, shipping or returns.
 */
export function getFaq(t: Translate): FaqItem[] {
  return [
    {question: t('faqData.compositionQ'), answer: t('faqData.compositionA')},
    {
      question: t('faqData.manufacturingQ'),
      answer: t('faqData.manufacturingA'),
    },
    {question: t('faqData.careQ'), answer: t('faqData.careA')},
  ];
}
