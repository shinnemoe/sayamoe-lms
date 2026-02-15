/**
 * Utility functions for handling duplicate-word names in quiz content
 */

/**
 * Combines duplicate consecutive words into a single capitalized word.
 * 
 * Examples:
 * - "I am Maung Maung" → "I am MaungMaung"
 * - "She is Su Su" → "She is SuSu"
 * - "Ko Ko went home" → "KoKo went home"
 * 
 * Pattern: Matches two consecutive identical words (case-insensitive)
 * and replaces with combined capitalized version.
 */
export function combineDuplicateNames(text: string): string {
    if (!text) return text;

    // Regex to match: Word Word (where both words are identical, case-insensitive)
    // Uses word boundaries (\b) to ensure we match complete words
    // Captures the word and looks ahead for the same word
    return text.replace(/\b([A-Z][a-z]+)\s+\1\b/g, (match, word) => {
        // Combine: "Maung Maung" → "MaungMaung"
        return word + word;
    });
}

/**
 * Applies combineDuplicateNames to all text fields in an exercise object
 */
export function cleanExerciseText(exercise: any): any {
    const cleaned = { ...exercise };

    // Multiple Choice fields
    if (cleaned.mcQuestion) {
        cleaned.mcQuestion = combineDuplicateNames(cleaned.mcQuestion);
    }
    if (cleaned.mcOptions && Array.isArray(cleaned.mcOptions)) {
        cleaned.mcOptions = cleaned.mcOptions.map((opt: any) => ({
            ...opt,
            text: combineDuplicateNames(opt.text || '')
        }));
    }

    // Unscramble fields
    if (cleaned.unscrambleQuestion) {
        cleaned.unscrambleQuestion = combineDuplicateNames(cleaned.unscrambleQuestion);
    }
    if (cleaned.unscramblePrompt) {
        cleaned.unscramblePrompt = combineDuplicateNames(cleaned.unscramblePrompt);
    }
    if (cleaned.unscrambleAnswer) {
        cleaned.unscrambleAnswer = combineDuplicateNames(cleaned.unscrambleAnswer);
    }

    // True/False fields
    if (cleaned.tfStatement) {
        cleaned.tfStatement = combineDuplicateNames(cleaned.tfStatement);
    }

    // Common fields
    if (cleaned.explanation) {
        cleaned.explanation = combineDuplicateNames(cleaned.explanation);
    }

    return cleaned;
}
