function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isNumeric(value) {
  return /^\d+$/.test(String(value || ''));
}

function parseMoney(value) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return Number(parsed.toFixed(2));
}

module.exports = {
  isValidEmail,
  isNumeric,
  parseMoney
};
