export function parseItemName(rawName) {
  const name = rawName.trim();

  // Common patterns
  const sizeRegex = /(\d+(?:\.\d+)?\s?(oz|fl oz|lb|lbs|g|kg|ct|count|pk|pack|gal|ml|l))/i;
  const qtyRegex = /(\d+)\s?(pack|pk|count|ct)/i;

  const sizeMatch = name.match(sizeRegex);
  const qtyMatch = name.match(qtyRegex);

  // Brand: first word(s) before product keywords (heuristic)
  const brandMatch = name.match(/^([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?)/);

  // Product description: everything between brand and size
  const productSection = name
    .replace(brandMatch ? brandMatch[0] : '', '')
    .replace(sizeMatch ? sizeMatch[0] : '', '')
    .replace(qtyMatch ? qtyMatch[0] : '', '')
    .trim();

  return {
    brand: brandMatch ? brandMatch[0] : null,
    product: productSection,
    size: sizeMatch ? sizeMatch[0] : null,
    quantity: qtyMatch ? qtyMatch[0] : null,
  };
}
