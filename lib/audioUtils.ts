/**
 * Audio utilities for text-to-speech using Web Speech API
 */

/**
 * Speaks the given text using browser's text-to-speech
 * @param text - The text to speak
 * @param options - Optional configuration for voice, rate, pitch
 */
export function speakText(
    text: string,
    options?: {
        rate?: number; // Speed (0.1 to 10, default 1)
        pitch?: number; // Pitch (0 to 2, default 1)
        volume?: number; // Volume (0 to 1, default 1)
        lang?: string; // Language (default 'en-US')
    }
): void {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser');
        return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply options
    utterance.rate = options?.rate ?? 1;
    utterance.pitch = options?.pitch ?? 1;
    utterance.volume = options?.volume ?? 1;
    utterance.lang = options?.lang ?? 'en-US';

    // Speak the text
    window.speechSynthesis.speak(utterance);
}

/**
 * Stops any currently playing speech
 */
export function stopSpeaking(): void {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

/**
 * Check if speech synthesis is currently speaking
 */
export function isSpeaking(): boolean {
    if ('speechSynthesis' in window) {
        return window.speechSynthesis.speaking;
    }
    return false;
}
