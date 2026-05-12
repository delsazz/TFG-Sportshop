import { loadStripe } from '@stripe/stripe-js';
let stripePromise = null;
export const getStripe = (publishableKey) => {
    if (!stripePromise) {
        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
};
export { loadStripe as loadStripeJs };
