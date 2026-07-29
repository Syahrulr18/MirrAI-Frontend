export interface ScriptAccuracyResult {
  accuracyPercentage: number;
  matchedWords: number;
  missedWords: number;
  extraWords: number;
}

/**
 * Normalize text for comparison:
 * - Lowercase
 * - Remove all punctuation (Unicode-safe)
 * - Split into words
 */
function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")                     // Decompose accents
    .replace(/[\u0300-\u036f]/g, "")      // Remove accent marks
    .replace(/[^\p{L}\p{N}\s-]/gu, "")    // Keep letters (any language), numbers, spaces, hyphens
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Calculate similarity between two words using Levenshtein distance.
 * Returns a value between 0 (completely different) and 1 (identical).
 */
function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;

  const lenA = a.length;
  const lenB = b.length;

  // Quick exit for very different lengths
  if (Math.abs(lenA - lenB) > Math.max(lenA, lenB) * 0.5) return 0;

  const matrix: number[][] = [];
  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[lenA][lenB];
  const maxLen = Math.max(lenA, lenB);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

/**
 * Calculates how well the spoken transcript matches the original script text.
 * Uses fuzzy word matching with Levenshtein distance to tolerate
 * speech recognition inaccuracies (e.g., "presentation" vs "presentasi").
 * 
 * The algorithm uses a greedy approach with a configurable lookahead window:
 * For each spoken word, it scans ahead in the script to find a fuzzy match.
 * A word is considered matched if the similarity is >= 0.6 (60%).
 */
export function calculateScriptAccuracy(scriptText: string, transcriptText: string): ScriptAccuracyResult {
  if (!scriptText || !scriptText.trim()) {
    return { accuracyPercentage: 100, matchedWords: 0, missedWords: 0, extraWords: 0 };
  }

  const scriptWords = normalizeText(scriptText);
  const spokenWords = normalizeText(transcriptText);

  if (scriptWords.length === 0) {
    return { accuracyPercentage: 100, matchedWords: 0, missedWords: 0, extraWords: 0 };
  }
  if (spokenWords.length === 0) {
    return {
      accuracyPercentage: 0,
      matchedWords: 0,
      missedWords: scriptWords.length,
      extraWords: 0,
    };
  }

  // Greedy match with fuzzy comparison and wider lookahead
  let matched = 0;
  let scriptIdx = 0;
  let spokenIdx = 0;
  let extraWords = 0;

  const LOOKAHEAD = 8; // Wider window to handle skipped/inserted words
  const SIMILARITY_THRESHOLD = 0.6; // 60% similarity = match

  while (spokenIdx < spokenWords.length && scriptIdx < scriptWords.length) {
    const spokenWord = spokenWords[spokenIdx];

    let bestMatchIdx = -1;
    let bestSimilarity = 0;

    // Look ahead in script words for the best fuzzy match
    for (let i = 0; i < LOOKAHEAD && scriptIdx + i < scriptWords.length; i++) {
      const sim = wordSimilarity(scriptWords[scriptIdx + i], spokenWord);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestMatchIdx = i;
      }
    }

    if (bestSimilarity >= SIMILARITY_THRESHOLD && bestMatchIdx >= 0) {
      matched++;
      scriptIdx += bestMatchIdx + 1; // Advance script past the matched word
    } else {
      extraWords++;
    }

    spokenIdx++;
  }

  // Any remaining unmatched spoken words
  if (spokenIdx < spokenWords.length) {
    extraWords += spokenWords.length - spokenIdx;
  }

  const missedWords = scriptWords.length - matched;
  const accuracyPercentage = Math.round((matched / scriptWords.length) * 100);

  return {
    accuracyPercentage: Math.max(0, Math.min(100, accuracyPercentage)),
    matchedWords: matched,
    missedWords,
    extraWords,
  };
}
