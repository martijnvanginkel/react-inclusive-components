/**
 * Returns `items` sorted by their elements' position in the document. Registration or
 * mount order is not reliable for keyboard navigation — items inserted or reordered
 * later would navigate out of visual order — so sort by actual DOM position.
 */
export function sortByDomPosition<T>(
  items: readonly T[],
  getEl: (item: T) => HTMLElement | undefined,
): T[] {
  return items.slice().sort((a, b) => {
    const ea = getEl(a);
    const eb = getEl(b);
    if (!ea || !eb || ea === eb) return 0;
    return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
}
