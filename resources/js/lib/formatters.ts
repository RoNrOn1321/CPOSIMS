export function formatMoney(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatWeight(weightGrams: number) {
  if (weightGrams >= 1000) {
    return `${(weightGrams / 1000).toFixed(2)} kg`;
  }
  return `${weightGrams} g`;
}
