export const getDisplayCode = (val: string | number | undefined | null) => {
  const s = String(val || '');
  if (!s) return '';
  const hex = s.replace(/[^a-fA-F0-9]/g, '') || s;
  const last4 = hex.slice(-4).padStart(4, '0');
  return `#${last4}`;
};

export const parseDisplayDate = (date?: string) => {
  if (!date) return undefined;
  const [mm, dd, yyyy] = date.split('/');
  if (mm?.length !== 2 || dd?.length !== 2 || yyyy?.length !== 4) return undefined;
  const iso = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  if (Number.isNaN(iso.getTime())) return undefined;
  return iso.toISOString();
};

export const getCustomerCountry = (customer: any, fallback?: string, normalizeCountry?: (value?: string) => string | undefined) => {
  if (!normalizeCountry) {
    // Fallback if normalizeCountry not provided
    const value = customer?.country ||
      customer?.addresses?.[0]?.country ||
      customer?.address?.country ||
      customer?.billingAddress?.country ||
      customer?.shippingAddress?.country ||
      fallback;
    return value || '—';
  }
  
  return normalizeCountry(
    customer?.country ||
      customer?.addresses?.[0]?.country ||
      customer?.address?.country ||
      customer?.billingAddress?.country ||
      customer?.shippingAddress?.country ||
      fallback,
  ) || '—';
};

