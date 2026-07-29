export interface ScriptAccuracyResult {
  accuracyPercentage: number;
  matchedWords: number;
  missedWords: number;
  extraWords: number;
}

/**
 * Calculates how well the spoken transcript matches the original script text.
 * Uses a simplified greedy string matching approach to count matching words in order.
 */
export function calculateScriptAccuracy(scriptText: string, transcriptText: string): ScriptAccuracyResult {
  if (!scriptText || !scriptText.trim()) {
    return { accuracyPercentage: 100, matchedWords: 0, missedWords: 0, extraWords: 0 };
  }

  // Normalize text: remove punctuation, convert to lowercase, split into words
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // remove punctuation except hyphens
      .split(/\s+/)
      .filter((w) => w.length > 0);
  };

  const scriptWords = normalize(scriptText);
  const spokenWords = normalize(transcriptText);

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

  // Greedy match: iterate through spoken words and see if they match the next expected script word.
  // We allow a small lookahead window to recover from skipped words.
  let matched = 0;
  let scriptIdx = 0;
  let spokenIdx = 0;
  let extraWords = 0;

  const LOOKAHEAD = 5;

  while (spokenIdx < spokenWords.length && scriptIdx < scriptWords.length) {
    const spokenWord = spokenWords[spokenIdx];

    let foundMatch = false;
    // Look ahead in script to see if the user skipped some words
    for (let i = 0; i < LOOKAHEAD; i++) {
      if (scriptIdx + i < scriptWords.length && scriptWords[scriptIdx + i] === spokenWord) {
        matched++;
        scriptIdx += i + 1; // Advance script past the matched word
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      extraWords++;
    }

    spokenIdx++;
  }

  // Any remaining words in transcript are extra
  if (spokenIdx < spokenWords.length) {
    extraWords += spokenWords.length - spokenIdx;
  }

  const missedWords = scriptWords.length - matched;

  // Accuracy calculation: what percentage of script words were actually spoken?
  const accuracyPercentage = Math.round((matched / scriptWords.length) * 100);

  return {
    accuracyPercentage: Math.max(0, Math.min(100, accuracyPercentage)),
    matchedWords: matched,
    missedWords,
    extraWords,
  };
}
