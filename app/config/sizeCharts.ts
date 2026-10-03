/**
 * Size charts — the garment's real measurements, per size.
 *
 * Fill these with measurements taken on the actual pieces (laid flat, in
 * cm). Never estimate: a wrong chart sends customers to the wrong size.
 *
 * A product uses, in order:
 *   1. its own Shopify metafield custom.size_chart (JSON, same shape as
 *      `chart` below), if set;
 *   2. the first entry here whose `match` fits its product type or title;
 *   3. otherwise no table — the size chart then shows how to measure and
 *      the sizes in stock, and invites the customer to ask.
 *
 * Example entry:
 *   {
 *     match: /hoodie|zip/i,
 *     chart: {
 *       columns: ['Chest', 'Length', 'Sleeve'],
 *       rows: [
 *         ['S', 58, 68, 60],
 *         ['M', 61, 70, 61],
 *       ],
 *     },
 *   },
 */
export type SizeChart = {
  /** Measurement names, in the order of the values in each row. */
  columns: string[];
  /** [size, value, value, …] — values in `unit`. */
  rows: (string | number)[][];
  /** Defaults to cm. */
  unit?: string;
  note?: string;
};

export const SIZE_CHARTS: {match: RegExp; chart: SizeChart}[] = [];

/** How to take each measurement, shown under the table. */
export const HOW_TO_MEASURE: Record<string, string> = {
  Chest: 'Laid flat, from armpit to armpit.',
  Length: 'From the highest point of the shoulder to the hem.',
  Sleeve: 'From the shoulder seam to the end of the cuff.',
  Shoulders: 'Laid flat, from one shoulder seam to the other.',
  Waist: 'Laid flat, straight across the waistband.',
  Hips: 'Laid flat, straight across at the widest point.',
  Inseam: 'From the crotch seam to the bottom of the leg.',
  Rise: 'From the crotch seam to the top of the waistband.',
  'Leg opening': 'Laid flat, straight across the bottom of the leg.',
};

/** Reads custom.size_chart; anything malformed is ignored, never shown. */
export function parseSizeChart(value?: string | null): SizeChart | null {
  if (!value) return null;
  try {
    const data = JSON.parse(value) as Partial<SizeChart>;
    if (
      !Array.isArray(data.columns) ||
      !Array.isArray(data.rows) ||
      !data.columns.every((c) => typeof c === 'string') ||
      !data.rows.every(
        (row) =>
          Array.isArray(row) &&
          row.length === data.columns!.length + 1 &&
          row.every((cell) => ['string', 'number'].includes(typeof cell)),
      )
    ) {
      return null;
    }
    return {
      columns: data.columns,
      rows: data.rows,
      unit: typeof data.unit === 'string' ? data.unit : 'cm',
      note: typeof data.note === 'string' ? data.note : undefined,
    };
  } catch {
    return null;
  }
}

export function sizeChartFor(product: {
  title: string;
  productType?: string | null;
  sizeChart?: {value?: string | null} | null;
}): SizeChart | null {
  const own = parseSizeChart(product.sizeChart?.value);
  if (own) return own;
  const haystack = `${product.productType ?? ''} ${product.title}`;
  return SIZE_CHARTS.find((entry) => entry.match.test(haystack))?.chart ?? null;
}
