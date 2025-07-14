import { transform } from 'valibot';

export function stripDate() {
  return transform((input: string): string => {
    if (input.length >= 2 && input.startsWith('"') && input.endsWith('"')) {
      // Only strip if it's a string, has at least two characters (to contain quotes),
      // and starts/ends with a double quote.
      return input.slice(1, -1);
    }
    return input; // Return input unchanged if conditions are not met
  });
}