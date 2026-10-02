const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0, maximumFractionDigits: 0 });
export function formatCurrency(amount) {
  const value = Number(amount ?? 0);
  return formatter.format(Number.isFinite(value) ? value : 0);
}
