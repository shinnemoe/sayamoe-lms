# Sayamoe - English Learning App

A fast, sleek flashcard-style English learning app with auto-generated quiz variations.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   - Copy `.env.local.example` to `.env.local`
   - Add your Firebase credentials

3. **Run locally:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 📱 Features

### Student Side
- **Dashboard**: View assigned topics with progress tracking
- **3 Quiz Types**:
  - 🔤 **Unscramble**: Arrange words in correct order
  - ✓✗ **True/False**: Quick yes/no questions
  - 📝 **Multiple Choice**: Choose the right answer
- **Score Tracking**: Best scores and attempt history

### Admin Side
- **Simple Dashboard** at `/admin`
- Create topics and exercises
- Auto-generates 3 quiz types from single exercise
- Manage everything in one place

## 🎨 Design
- Sleek, minimal UI with gradient themes
- Fast animations and transitions
- Mobile-responsive
- Game-like feedback

## 🔧 Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth + Firestore)
- Git version control

## 📦 Project Structure
```
sayamoe/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── student/        # Student pages
│   ├── teacher/        # Teacher pages (optional)
│   └── login/          # Authentication
├── components/
│   └── quiz/           # Quiz components
├── lib/
│   ├── firebase.ts     # Firebase config
│   └── quizGenerator.ts # Auto-quiz logic
└── types/              # TypeScript types
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## 📝 Usage

1. **Admin**: Go to `/admin` to create topics and exercises
2. **Students**: Login at `/login?role=student`
3. **Teachers**: Login at `/login?role=teacher` (optional)

## 🔐 Firebase Setup

Required collections:
- `users` - User accounts
- `topics` - Learning topics
- `exercises` - Exercise questions
- `scores` - Student scores
- `classes` - Student classes (optional)

## 💾 Git Commits
All changes are automatically committed to Git for safety!

---

Built with ❤️ for fast, effective learning
