// Utility function for conditional classnames (similar to clsx/tailwind-merge)
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
