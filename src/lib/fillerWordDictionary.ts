// Dictionary of filler words per language
export const fillerWordDictionary: Record<string, string[]> = {
  en: [
    "um",
    "uh",
    "er",
    "ah",
    "like",
    "you know",
    "i mean",
    "sort of",
    "kind of",
    "basically",
    "actually",
    "literally",
    "honestly",
    "right",
    "so yeah",
  ],
  id: [
    "eee",
    "ee",
    "emm",
    "em",
    "anu",
    "apa namanya",
    "kayak",
    "kayaknya",
    "maksudnya",
    "jadi",
    "gitu",
    "gitu ya",
    "nah",
    "nah kan",
    "berarti",
  ],
};

/**
 * Check if a given string contains filler words and return matched filler words
 */
export function detectFillerWords(text: string, lang: string = "en"): string[] {
  const dictionary = fillerWordDictionary[lang] || fillerWordDictionary["en"];
  const lowerText = text.toLowerCase();
  const matched: string[] = [];

  for (const filler of dictionary) {
    // Regex for word boundary matching
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|\\s)${escaped}(?:\\s|$|[.,!?])`, "gi");

    const matches = lowerText.match(regex);
    if (matches) {
      for (let i = 0; i < matches.length; i++) {
        matched.push(filler);
      }
    }
  }

  // Dynamic regex for elongated filler sounds: eee, emmm, uhhh, ahhh, hmmm
  const dynamicRegex = /\b([aeiou])\1{2,}\b|\b([h]?m+)\b|\b(u+h+)\b|\b(a+h+)\b/gi;
  const dynamicMatches = lowerText.match(dynamicRegex);
  
  if (dynamicMatches) {
    for (const match of dynamicMatches) {
      const word = match.toLowerCase();
      // Avoid pushing short common words that might get caught
      if (word.length >= 3 && !matched.includes(word) && !dictionary.includes(word)) {
        matched.push(word);
      }
    }
  }

  return matched;
}
