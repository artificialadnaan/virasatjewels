declare global {
  // eslint-disable-next-line no-var
  var gtag: (
    command: string,
    targetId: string,
    params?: Record<string, unknown>
  ) => void;
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  window.gtag("event", eventName, params);
}

export function trackViewItem(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}): void {
  trackEvent("view_item", {
    currency: "USD",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category,
      },
    ],
  });
}

export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
}): void {
  trackEvent("add_to_cart", {
    currency: "USD",
    value: product.price * (product.quantity ?? 1),
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity ?? 1,
        item_category: product.category,
      },
    ],
  });
}

export function trackBeginCheckout(params: {
  value: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}): void {
  trackEvent("begin_checkout", {
    currency: "USD",
    value: params.value,
    items: params.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  shipping?: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}): void {
  trackEvent("purchase", {
    transaction_id: params.transactionId,
    currency: "USD",
    value: params.value,
    shipping: params.shipping ?? 0,
    items: params.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}
