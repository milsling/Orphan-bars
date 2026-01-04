const BLOCKED_TERMS = [
  "cp",
  "child porn",
  "childporn", 
  "pedo",
  "pedophile",
  "pedophilia",
  "underage",
  "minor sex",
  "kid sex",
  "child sex",
  "loli",
  "shota",
  "preteen",
  "jailbait",
  "csam",
  "child abuse",
  "molest child",
  "molest kid",
  "young boy",
  "young girl",
];

const BLOCKED_PATTERNS = [
  /\b\d+\s*y\.?o\.?\s*(boy|girl|kid|child)/i,
  /\b(sex|fuck|rape)\s*(with|a|the)?\s*(child|kid|minor|underage|preteen)/i,
  /(child|kid|minor|underage|preteen)\s*(sex|fuck|rape)/i,
];

export function containsProhibitedContent(text: string): { blocked: boolean; reason?: string } {
  const lowerText = text.toLowerCase();
  
  for (const term of BLOCKED_TERMS) {
    if (lowerText.includes(term.toLowerCase())) {
      return { 
        blocked: true, 
        reason: "Content contains prohibited terms related to child exploitation" 
      };
    }
  }
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { 
        blocked: true, 
        reason: "Content contains prohibited patterns related to child exploitation" 
      };
    }
  }
  
  return { blocked: false };
}
