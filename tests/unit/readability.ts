/** Flesch–Kincaid grade of one string: 0.39 words/sentence + 11.8 syllables/word − 15.59.
 * Syllables are counted by vowel groups, which is crude and errs slightly high on words
 * like "axe" and "queue" — so a pass here is a real pass. Shared by the deck's copy test
 * and the app's (G9: grade ≤ 8). */
export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}

export function gradeLevel(text: string): number {
  const sentences = text.split(/(?<=[.!?”])\s+(?=[A-Z“])/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w));
  if (words.length === 0 || sentences.length === 0) return 0;
  const syll = words.reduce((sum, w) => sum + syllables(w), 0);
  return 0.39 * (words.length / sentences.length) + 11.8 * (syll / words.length) - 15.59;
}
