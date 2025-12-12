export const formatVnd = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "₫0";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

