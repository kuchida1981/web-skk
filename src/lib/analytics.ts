export const trackEvent = (name: string, params?: Record<string, any>) => {
  window.gtag?.('event', name, params);
};
