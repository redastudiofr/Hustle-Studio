/** A Shopify product as the homepage sections need it. */
export type HomeImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type HomeColor = {
  name: string;
  /** Shopify swatch colour, when set on the option value. */
  swatch: string | null;
  /** Photo of a variant in that colour. */
  image: HomeImage | null;
};

export type HomeVariant = {
  id: string;
  size: string | null;
  color: string | null;
  price: number;
  availableForSale: boolean;
};

export type LandingProduct = {
  id: string;
  title: string;
  handle: string;
  price: number;
  image: HomeImage | null;
  colors: HomeColor[];
  variants: HomeVariant[];
};
