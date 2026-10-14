export function normalizeProductOptions(value, fieldName) {
  if (value === undefined) return { options: [] };
  if (!Array.isArray(value)) {
    return { error: `${fieldName} must be a list of options.` };
  }

  const options = [];
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== 'string') {
      return { error: `${fieldName} options must be text.` };
    }

    const option = item.trim();
    if (!option) continue;
    if (option.length > 40) {
      return { error: `Each ${fieldName.toLowerCase()} option must be 40 characters or fewer.` };
    }

    const normalized = option.toLocaleLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      options.push(option);
    }
    if (options.length > 20) {
      return { error: `${fieldName} can contain no more than 20 options.` };
    }
  }

  return { options };
}
