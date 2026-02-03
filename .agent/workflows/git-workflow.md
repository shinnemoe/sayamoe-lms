---
description: Safe Git workflow to protect your work
---

# Safe Git Workflow for Sayamoe LMS

## 🎯 Core Principle
**Commit early, commit often!** Every time you complete a feature or make significant changes, save them with Git.

---

## 📅 Daily Workflow

### 1. Check Current Status
Before starting work, see what's changed:
```powershell
git status
```

### 2. Save Your Work (Commit)
After completing a feature or at the end of your session:

```powershell
# See what changed
git status

# Add all changed files
git add .

# Commit with a descriptive message
git commit -m "feat: add quiz scoring and results page"
```

**Commit Message Examples:**
- `feat: add class management to admin dashboard`
- `fix: correct scoring bug in quiz page`
- `refactor: improve student dashboard UI`
- `docs: add testing guide`

### 3. View Your History
See all your saved commits:
```powershell
git log --oneline -10
```

---

## 🚨 Emergency: Made a Mistake?

### If you haven't committed yet:
**Option 1: Discard changes to ONE file**
```powershell
git checkout HEAD -- path/to/file.tsx
```

**Option 2: Undo ALL uncommitted changes** (⚠️ DANGEROUS)
```powershell
git reset --hard HEAD
```

### If you already committed:
**Undo last commit but keep changes:**
```powershell
git reset --soft HEAD~1
```

**Undo last commit and discard changes:** (⚠️ DANGEROUS)
```powershell
git reset --hard HEAD~1
```

**Go back to a specific commit:**
```powershell
# First, find the commit hash
git log --oneline -10

# Then reset to it
git reset --hard <commit-hash>
```

---

## 🌿 Branch Workflow (Recommended for Features)

**Why use branches?** They let you experiment without breaking working code!

### Create a branch for a new feature:
```powershell
# Create and switch to new branch
git checkout -b feature/add-leaderboard

# Do your work...
# When done, commit
git add .
git commit -m "feat: add leaderboard page"

# Switch back to main branch
git checkout master

# Merge the feature in
git merge feature/add-leaderboard

# Delete the feature branch (optional)
git branch -d feature/add-leaderboard
```

---

## 📦 Backup to GitHub (Highly Recommended)

### One-time setup:
1. Create a repository on [GitHub](https://github.com)
2. Link your local repo:
```powershell
git remote add origin https://github.com/yourusername/sayamoe.git
git branch -M main
git push -u origin main
```

### Daily backup:
```powershell
git push
```

---

## 🛡️ Recommended Daily Routine

**Every time you finish working:**
```powershell
# 1. Check what changed
git status

# 2. Save your work
git add .
git commit -m "describe what you did"

# 3. (Optional) Push to GitHub for backup
git push
```

**Before making risky changes:**
```powershell
# Create a backup branch
git checkout -b backup-before-refactor

# Switch back to main
git checkout master

# Now do your changes. If you mess up, you can:
git reset --hard backup-before-refactor
```

---

## 📋 Quick Reference

| Command | What it does |
|---------|------------|
| `git status` | See what changed |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save changes with message |
| `git log --oneline` | View commit history |
| `git checkout -b branch-name` | Create new branch |
| `git checkout master` | Switch to master branch |
| `git merge branch-name` | Merge branch into current |
| `git reset --hard HEAD` | ⚠️ Discard all uncommitted changes |
| `git reset --hard HEAD~1` | ⚠️ Undo last commit |

---

## 🎓 Pro Tips

1. **Commit after every working feature** - Don't wait until end of day
2. **Use descriptive commit messages** - "fix bug" is bad, "fix scoring calculation in quiz page" is good
3. **Push to GitHub daily** - Free cloud backup!
4. **Use branches for experiments** - Keep master/main stable
5. **Never use `--hard` unless you're sure** - It permanently deletes changes

---

## 🚀 Next Steps

1. Commit your current work right now!
2. Set up GitHub remote for cloud backup
3. Practice creating branches for new features
