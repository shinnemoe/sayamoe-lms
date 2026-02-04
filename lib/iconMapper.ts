/**
 * Icon Mapper - Automatically assigns relevant emojis to quiz options based on keywords
 * Used for making quiz cards more visually engaging and contextually relevant
 */

export const iconMap: Record<string, string | string[]> = {
    // Animals
    'cat|kitten|feline': '🐱',
    'dog|puppy|canine': '🐶',
    'bird|eagle|owl|sparrow|chicken|duck': '🐦',
    'fish|salmon|tuna|goldfish': '🐟',
    'elephant': '🐘',
    'lion|tiger|leopard': '🦁',
    'monkey|ape|gorilla': '🐵',
    'bear': '🐻',
    'pig|hog': '🐷',
    'cow|cattle': '🐮',
    'horse|pony': '🐴',
    'sheep|lamb': '🐑',
    'rabbit|bunny': '🐰',
    'mouse|rat': '🐭',
    'frog|toad': '🐸',
    'snake|serpent': '🐍',
    'turtle|tortoise': '🐢',
    'bee|honeybee': '🐝',
    'butterfly': '🦋',
    'spider': '🕷️',

    // Food & Drinks
    'apple': '🍎',
    'banana': '🍌',
    'orange|citrus': '🍊',
    'strawberry': '🍓',
    'grape|grapes': '🍇',
    'watermelon|melon': '🍉',
    'pizza': '🍕',
    'burger|hamburger': '🍔',
    'sandwich': '🥪',
    'hot dog|hotdog': '🌭',
    'bread|toast': '🍞',
    'cheese': '🧀',
    'egg|eggs': '🥚',
    'meat|steak|beef': '🥩',
    'chicken|poultry': '🍗',
    'bacon': '🥓',
    'rice': '🍚',
    'noodle|pasta|spaghetti': '🍜',
    'soup': '🍲',
    'salad': '🥗',
    'cake|birthday': '🎂',
    'cookie|biscuit': '🍪',
    'candy|sweet': '🍬',
    'chocolate': '🍫',
    'ice cream|icecream': '🍦',
    'donut|doughnut': '🍩',
    'water': '💧',
    'coffee': '☕',
    'tea': '🍵',
    'milk': '🥛',
    'juice': '🧃',
    'soda|pop': '🥤',

    // School & Education
    'book|read|reading|novel|dictionary': '📚',
    'pen|write|writing': '✏️',
    'pencil': '✏️',
    'paper|document|essay': '📄',
    'notebook': '📓',
    'math|mathematics|calculate|calculation|algebra|geometry': '🔢',
    'science|experiment|laboratory': '🔬',
    'art|paint|draw|painting|drawing': '🎨',
    'music|sing|song|melody': '🎵',
    'school|classroom|academy': '🏫',
    'student|pupil|learner': '🎓',
    'teacher|professor|instructor': '👨‍🏫',
    'backpack|bag': '🎒',
    'globe|world map': '🌍',
    'computer|laptop|pc': '💻',
    'calculator': '🧮',
    'microscope': '🔬',
    'test|exam|quiz': '📝',
    'graduation|graduate|diploma': '🎓',

    // Nature & Weather
    'tree|forest|woods': '🌳',
    'flower|rose|tulip|blossom': '🌸',
    'plant|bush|shrub': '🌿',
    'grass|lawn': '🌱',
    'sun|sunny|sunshine': '☀️',
    'rain|rainy|rainfall': '🌧️',
    'cloud|cloudy|overcast': '☁️',
    'snow|snowy|snowfall': '❄️',
    'wind|windy|breeze': '💨',
    'storm|thunder|lightning': '⛈️',
    'rainbow': '🌈',
    'star|stars': '⭐',
    'moon': '🌙',
    'mountain|hill': '⛰️',
    'volcano': '🌋',
    'island': '🏝️',
    'desert': '🏜️',

    // Colors
    'red': '🔴',
    'blue': '🔵',
    'green': '🟢',
    'yellow': '🟡',
    'orange': '🟠',
    'purple|violet': '🟣',
    'brown': '🟤',
    'black': '⚫',
    'white': '⚪',
    'pink': '🩷',

    // Actions & Verbs
    'run|running|jog|jogging': '🏃',
    'walk|walking|stroll': '🚶',
    'jump|jumping|leap': '🤸',
    'swim|swimming': '🏊',
    'eat|eating': '🍽️',
    'drink|drinking': '🥤',
    'sleep|sleeping|rest': '😴',
    'play|playing': '🎮',
    'dance|dancing': '💃',
    'sing|singing': '🎤',
    'study|studying': '📖',
    'work|working': '💼',
    'clean|cleaning': '🧹',
    'cook|cooking': '🍳',
    'think|thinking': '🤔',
    'laugh|laughing': '😄',
    'cry|crying': '😢',

    // Time
    'morning|dawn|sunrise': '🌅',
    'afternoon|noon|midday': '☀️',
    'evening|dusk|sunset': '🌆',
    'night|nighttime|midnight': '🌙',
    'clock|time|hour|minute': '⏰',
    'watch|wristwatch': '⌚',
    'calendar|date': '📅',
    'today': '📆',
    'yesterday': '📅',
    'tomorrow': '📅',

    // Places & Locations
    'home|house|residence': '🏠',
    'school|college|university': '🏫',
    'hospital|clinic': '🏥',
    'park|playground': '🌳',
    'beach|ocean|sea|shore': '🏖️',
    'city|town|urban': '🏙️',
    'village|rural': '🏘️',
    'farm|ranch': '🚜',
    'library': '📚',
    'museum': '🏛️',
    'theater|theatre|cinema|movie': '🎭',
    'restaurant|cafe|diner': '🍽️',
    'store|shop|market': '🏪',
    'bank': '🏦',
    'church|temple|mosque': '⛪',

    // People & Family
    'mother|mom|mum|mama': '👩',
    'father|dad|papa': '👨',
    'parent|parents': '👨‍👩‍👦',
    'boy|son': '👦',
    'girl|daughter': '👧',
    'baby|infant': '👶',
    'child|children|kid': '👶',
    'man|male|gentleman': '👨',
    'woman|female|lady': '👩',
    'grandmother|grandma|granny': '👵',
    'grandfather|grandpa': '👴',
    'friend|buddy|pal': '👫',
    'family': '👨‍👩‍👦',

    // Objects & Things
    'car|automobile|vehicle': '🚗',
    'bus': '🚌',
    'train|railway': '🚂',
    'airplane|plane|aircraft': '✈️',
    'bike|bicycle': '🚲',
    'motorcycle|motorbike': '🏍️',
    'boat|ship': '⛵',
    'rocket|spaceship': '🚀',
    'phone|telephone|cellphone|mobile': '📱',
    'television|tv': '📺',
    'radio': '📻',
    'camera': '📷',
    'key|keys': '🔑',
    'door': '🚪',
    'window': '🪟',
    'chair|seat': '🪑',
    'table|desk': '🪑',
    'bed': '🛏️',
    'lamp|light': '💡',
    'ball|sphere': '⚽',
    'toy|toys': '🧸',
    'gift|present': '🎁',
    'balloon|balloons': '🎈',
    'umbrella': '☂️',
    'glasses|spectacles': '👓',
    'hat|cap': '🎩',
    'shoe|shoes|footwear': '👞',
    'shirt|clothes|clothing': '👕',

    // Emotions & Feelings
    'happy|happiness|joy|joyful|smile|cheerful': '😊',
    'sad|sadness|unhappy': '😢',
    'angry|anger|mad|furious': '😠',
    'love|loving|affection': '❤️',
    'excited|excitement|thrilled': '🤩',
    'scared|fear|afraid|frightened': '😨',
    'surprised|surprise|shock': '😮',
    'tired|exhausted|sleepy': '😴',
    'sick|ill|unwell': '🤒',
    'confused|confusion': '😕',

    // Numbers
    'one|1|first': '1️⃣',
    'two|2|second': '2️⃣',
    'three|3|third': '3️⃣',
    'four|4|fourth': '4️⃣',
    'five|5|fifth': '5️⃣',
    'six|6|sixth': '6️⃣',
    'seven|7|seventh': '7️⃣',
    'eight|8|eighth': '8️⃣',
    'nine|9|ninth': '9️⃣',
    'ten|10|tenth': '🔟',
    'zero|0': '0️⃣',
    'hundred': '💯',

    // Shapes & Symbols
    'circle|round': '⭕',
    'square': '⬜',
    'triangle': '🔺',
    'star': '⭐',
    'heart': '❤️',
    'check|correct|right|yes': '✅',
    'cross|wrong|incorrect|no': '❌',
    'question|ask': '❓',
    'exclamation|important': '❗',

    // Sports & Activities
    'football|soccer': '⚽',
    'basketball': '🏀',
    'baseball': '⚾',
    'tennis': '🎾',
    'volleyball': '🏐',
    'cycling|bike': '🚴',
    'running|run': '🏃',
    'golf': '⛳',
    'skiing|ski': '⛷️',

    // Seasons
    'spring': '🌸',
    'summer': '☀️',
    'autumn|fall': '🍂',
    'winter': '❄️',

    // Directions
    'up|upward|above': '⬆️',
    'down|downward|below': '⬇️',
    'left': '⬅️',
    'right': '➡️',
    'north': '⬆️',
    'south': '⬇️',
    'east': '➡️',
    'west': '⬅️',

    // Size & Quantity
    'big|large|huge|giant': '🔴',
    'small|tiny|little': '🔵',
    'many|much|lot': '💯',
    'few|little|less': '1️⃣',

    // Fallback generic icons (rotated based on hash)
    'default': ['🎯', '⭐', '✨', '🎪', '🎁', '🌟', '💡', '🔔']
};

/**
 * Finds the best matching icon for a given text
 * @param text - The text to analyze (quiz option, word, etc.)
 * @returns An emoji icon that best represents the text
 */
export function findBestIcon(text: string): string {
    if (!text || typeof text !== 'string') {
        return '🎯'; // Default fallback
    }

    const lowerText = text.toLowerCase().trim();

    // Try to find matching keyword in our icon map
    for (const [keywords, icon] of Object.entries(iconMap)) {
        if (keywords === 'default') continue;

        // Handle array of icons (shouldn't happen except for 'default')
        if (Array.isArray(icon)) continue;

        // Split keywords by pipe and check each pattern
        const patterns = keywords.split('|');
        for (const pattern of patterns) {
            // Use word boundary matching for better accuracy
            // Check if the pattern is a whole word in the text
            const regex = new RegExp(`\\b${pattern}\\b`, 'i');
            if (regex.test(lowerText)) {
                return icon;
            }

            // Also check for simple includes as fallback
            if (lowerText.includes(pattern)) {
                return icon;
            }
        }
    }

    // Fallback: rotate through default icons based on text hash
    const defaults = iconMap['default'] as string[];
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return defaults[hash % defaults.length];
}
