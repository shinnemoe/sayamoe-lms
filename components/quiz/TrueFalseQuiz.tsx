'use client';

interface Props {
    question: string;
    explanation?: string;
    onAnswer: (answer: boolean) => void;
    showResult: boolean;
    isCorrect: boolean;
}

export default function TrueFalseQuiz({ question, explanation, onAnswer, showResult, isCorrect }: Props) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-8 text-center">{question}</h2>

            {!showResult ? (
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onAnswer(true)}
                        className="py-8 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all text-3xl font-bold"
                    >
                        ✓ TRUE
                    </button>
                    <button
                        onClick={() => onAnswer(false)}
                        className="py-8 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all text-3xl font-bold"
                    >
                        ✗ FALSE
                    </button>
                </div>
            ) : (
                <div className={`p-8 rounded-2xl ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <div className="text-center font-bold text-2xl mb-2">
                        {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                    </div>
                    {!isCorrect && explanation && (
                        <div className="text-base text-red-600 mt-3 pt-3 border-t border-red-300">
                            <span className="font-semibold">💡 Explanation:</span> {explanation}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
