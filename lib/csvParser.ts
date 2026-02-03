import { QuizType, Exercise, MultipleChoiceOption } from '@/types';

export interface CSVRow {
    [key: string]: string;
}

export function detectQuizType(headers: string[]): QuizType | null {
    const headerSet = new Set(headers.map(h => h.toLowerCase().trim()));

    // Multiple Choice: has distractor columns
    if (headerSet.has('question') && (headerSet.has('distractor1') || headerSet.has('option1'))) {
        return 'multipleChoice';
    }

    // Unscramble: has prompt and answer
    if (headerSet.has('prompt') || headerSet.has('unscramble')) {
        return 'unscramble';
    }

    // True/False: has statement
    if (headerSet.has('statement') || headerSet.has('trueFalse')) {
        return 'trueFalse';
    }

    return null;
}

export function parseMultipleChoiceCSV(rows: CSVRow[], topicId: string): Partial<Exercise>[] {
    return rows.map((row, index) => {
        const question = row.question || row.Question;
        const correctAnswer = row.answer || row.correctAnswer || row['correct answer'];

        // Collect all distractors/options
        const options: string[] = [correctAnswer];

        for (let i = 1; i <= 10; i++) {
            const distractor = row[`distractor${i}`] || row[`option${i}`] || row[`Distractor${i}`];
            if (distractor && distractor.trim()) {
                options.push(distractor.trim());
            }
        }

        // Shuffle options and find correct answer index
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        const correctIndex = shuffled.indexOf(correctAnswer);

        const mcOptions: MultipleChoiceOption[] = shuffled.map(text => ({ text }));

        return {
            topicId,
            quizType: 'multipleChoice' as QuizType,
            mcQuestion: question,
            mcOptions,
            mcCorrectAnswerIndex: correctIndex,
            order: index,
            createdAt: new Date()
        };
    });
}

export function parseUnscrambleCSV(rows: CSVRow[], topicId: string): Partial<Exercise>[] {
    return rows.map((row, index) => {
        const prompt = row.prompt || row.Prompt || row.question || 'Arrange the words in the correct order';
        const answer = row.answer || row.sentence || row.correctAnswer;

        return {
            topicId,
            quizType: 'unscramble' as QuizType,
            unscramblePrompt: prompt,
            unscrambleAnswer: answer,
            order: index,
            createdAt: new Date()
        };
    });
}

export function parseTrueFalseCSV(rows: CSVRow[], topicId: string): Partial<Exercise>[] {
    return rows.map((row, index) => {
        const statement = row.statement || row.Statement || row.question;
        const answer = row.answer || row.Answer || row.correct;

        // Convert string to boolean
        const boolAnswer = answer.toLowerCase() === 'true' || answer.toLowerCase() === 't' || answer === '1';

        return {
            topicId,
            quizType: 'trueFalse' as QuizType,
            tfStatement: statement,
            tfAnswer: boolAnswer,
            order: index,
            createdAt: new Date()
        };
    });
}

export function generateCSVTemplate(quizType: QuizType): string {
    switch (quizType) {
        case 'multipleChoice':
            return 'question,answer,distractor1,distractor2,distractor3\n' +
                '"What is the capital of France?",Paris,London,Berlin,Madrid\n' +
                '"What color is the sky?",Blue,Red,Green,Yellow';

        case 'unscramble':
            return 'prompt,answer\n' +
                '"Arrange the words:",I love learning English\n' +
                '"Put in correct order:",The cat is sleeping';

        case 'trueFalse':
            return 'statement,answer\n' +
                '"The Earth is flat",false\n' +
                '"Water boils at 100°C",true';

        default:
            return '';
    }
}

export function downloadCSVTemplate(quizType: QuizType) {
    const content = generateCSVTemplate(quizType);
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quizType}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
