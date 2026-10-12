export function formatMoney(amount: number, currency: string = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatWeight(weightGrams: number) {
  if (weightGrams >= 1000) {
    return `${(weightGrams / 1000).toFixed(2)} kg`;
  }
  return `${weightGrams} g`;
}
