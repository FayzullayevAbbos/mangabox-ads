/**
 * English dictionary — assembled from per-module JSON files.
 *
 * Keep one JSON file per feature module. Do not collapse everything into a
 * single file; the split keeps each dictionary small and easy to translate.
 */

import common from "./common.json";
import site from "./site.json";
import nav from "./nav.json";
import chrome from "./chrome.json";
import auth from "./auth.json";
import dashboard from "./dashboard.json";
import products from "./products.json";
import plans from "./plans.json";
import transactions from "./transactions.json";
import subscriptions from "./subscriptions.json";
import customers from "./customers.json";
import payout from "./payout.json";
import checkout from "./checkout.json";
import checkoutPay from "./checkoutPay.json";
import discounts from "./discounts.json";
import apiKeys from "./apiKeys.json";
import webhooks from "./webhooks.json";
import analytics from "./analytics.json";
import ads from "./ads.json";
import settings from "./settings.json";
import legal from "./legal.json";

export const en = {
  common,
  site,
  nav,
  chrome,
  auth,
  dashboard,
  products,
  plans,
  transactions,
  subscriptions,
  customers,
  payout,
  checkout,
  checkoutPay,
  discounts,
  apiKeys,
  webhooks,
  analytics,
  ads,
  settings,
  legal,
} as const;
