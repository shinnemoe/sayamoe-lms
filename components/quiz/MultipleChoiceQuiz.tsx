'use client';

interface Props {
    question: string;
    options: string[];
    onAnswer: (answer: string) => void;
    showResult: boolean;
    isCorrect: boolean;
}

export default function MultipleChoiceQuiz({ question, options, onAnswer, showResult, isCorrect }: Props) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-8">{question}</h2>

            <div className="space-y-3">
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onAnswer(option)}
                        disabled={showResult}
                        className="w-full p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 hover:shadow-lg transition-all text-left font-medium disabled:opacity-50"
                    >
                        <span className="inline-block w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center leading-8 mr-3">
                            {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                    </button>
                ))}
            </div>

            {showResult && (
                <div className={`mt-6 p-4 rounded-xl text-center font-bold text-lg ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                </div>
            )}
        </div>
    );
}
