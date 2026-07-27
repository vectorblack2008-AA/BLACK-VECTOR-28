import { loadStripe } from '@stripe/stripe-js';

export const getStripeClient = async () => {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!pk || pk === 'your_stripe_pk') return null;
  return loadStripe(pk);
};

export const STRIPE_PREMIUM_PRICE_MONTHLY = 1900;
export const STRIPE_PREMIUM_PRICE_YEARLY = 9900;
export const PREMIUM_CURRENCY = 'usd';
