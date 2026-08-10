/**
 * AI Memory & Feedback Learning Service
 * 
 * Stores and manages session memory and learned user preferences across chat turns.
 */

const MEMORY_STORAGE_KEY = "sabbir_ai_learned_memories";

export const getLearnedMemories = (): string[] => {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLearnedMemory = (insight: string): void => {
  if (!insight || insight.trim().length === 0) return;
  try {
    const memories = getLearnedMemories();
    const cleanInsight = insight.trim();
    if (!memories.includes(cleanInsight)) {
      memories.push(cleanInsight);
      if (memories.length > 20) memories.shift();
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
    }
  } catch (e) {
    console.warn("Could not save AI memory", e);
  }
};

export const clearLearnedMemories = (): void => {
  try {
    localStorage.removeItem(MEMORY_STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear AI memories", e);
  }
};
