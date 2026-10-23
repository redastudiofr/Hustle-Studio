# Page d'accueil

`app/routes/_index.tsx` affiche, dans l'ordre :

| # | Section | Composant (app/components/landing/) | Contenu | Affichée quand |
|---|---------|-------------------------------------|---------|----------------|
| 1 | Hero, 2 panneaux photo (slider sur mobile) | `HeroSplit.tsx` | `HOME.hero` | toujours ; bouton blanc seulement si `to` est rempli |
| 1 | Bandeau bleu défilant (CSS pur) | `ScrollingBand` dans `HeroSplit.tsx` | `HOME.band` | au moins un texte |
| 2 | Portés par vous (polaroids) | `Community.tsx` | `HOME.community.photos` | au moins une vraie photo |
| 3 | Vu partout + logos médias | `MediaCarousel.tsx` | `HOME.media.cards` / `logos` | au moins une carte / un logo |

- Textes et photos : `app/config/homeTemplate.ts` (`{en, fr}`). Les champs
  [entre crochets] des maquettes y sont vides et masquent leur section ou
  leur ligne tant qu'ils ne sont pas remplis.
- Styles : `app/styles/home.css` (classes `hx-`, mobile first).
