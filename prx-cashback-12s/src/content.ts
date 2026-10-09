/**
 * Every word and figure on screen lives here, so copy and rates swap in one place.
 *
 * PLACEHOLDER: the rates, order values and cashback amounts below are sample
 * figures. Replace them with live CLO rates on these exact merchants before
 * launch (see BUILD_NOTES.md). Amounts are AUD, stored in cents.
 */

export type MerchantId = 'princessPolly' | 'asos' | 'cottonOn';

export type Merchant = {
  id: MerchantId;
  name: string;
  /** Merchant banner copied from the design system's Merchant Banners group. */
  banner: string;
  /** PLACEHOLDER rate, percent. */
  ratePct: number;
  /** PLACEHOLDER sample order, cents. */
  orderCents: number;
  /** PLACEHOLDER cashback, cents. Must equal round(order * rate). */
  cashbackCents: number;
};

export const CATEGORY = 'Fashion';

export const MERCHANTS: Record<MerchantId, Merchant> = {
  princessPolly: {
    id: 'princessPolly',
    name: 'Princess Polly',
    banner: 'merchants/princess-polly-au.svg',
    ratePct: 5,
    orderCents: 8900,
    cashbackCents: 445,
  },
  asos: {
    id: 'asos',
    name: 'ASOS',
    banner: 'merchants/asos.svg',
    ratePct: 4,
    orderCents: 12000,
    cashbackCents: 480,
  },
  cottonOn: {
    id: 'cottonOn',
    name: 'Cotton On',
    banner: 'merchants/cotton-on.svg',
    ratePct: 6,
    orderCents: 6500,
    cashbackCents: 390,
  },
};

/** Receipt line order (beat 3). */
export const RECEIPT_ORDER: MerchantId[] = ['princessPolly', 'asos', 'cottonOn'];

export const TOTAL_CASHBACK_CENTS = RECEIPT_ORDER.reduce((sum, id) => sum + MERCHANTS[id].cashbackCents, 0);

/**
 * Headlines: one array entry per line. `accent` is the single Momo Trust
 * Display phrase for that headline, set on its own line.
 */
export const COPY = {
  beat1: {
    lines: ['Your last', 'Princess Polly order', 'paid you back'],
    accent: '$0.00',
  },
  beat2: {
    lines: ['Same with ASOS.', 'And Cotton On.'],
    accent: '$0 Cashback.',
    zeroTag: '$0.00',
  },
  beat3: {
    lines: ['Link your card once.', 'Cashback lands'],
    accent: 'automatically.',
    totalLabel: 'Total Cashback',
  },
  beat4: {
    lines: ['Shop like normal.'],
    accent: 'Get paid back.',
    cta: 'Link your card',
  },
} as const;

export const formatAud = (cents: number, sign = '') => `${sign}$${(cents / 100).toFixed(2)}`;
