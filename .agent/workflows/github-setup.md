---
description: How to set up GitHub backup for Sayamoe LMS
---

# GitHub Setup Guide for Sayamoe LMS

## 🎯 Why GitHub?
- **Cloud backup** - Never lose your work
- **Version history** - See all changes over time
- **Collaboration** - Easy to share with others
- **Free** - GitHub is free for public/private repos

---

## 📝 Step-by-Step Setup

### Step 1: Create GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Follow the registration process

---

### Step 2: Create a New Repository

1. **Go to GitHub** and log in
2. Click the **"+"** button in top-right corner
3. Select **"New repository"**

**Fill in the details:**
- **Repository name**: `sayamoe` (or `sayamoe-lms`)
- **Description**: "Learning Management System with quiz features"
- **Visibility**: 
  - Choose **Private** (only you can see it)
  - Or **Public** (anyone can see it)
- **DO NOT** check "Add a README file" (we already have code)
- **DO NOT** add .gitignore or license

4. Click **"Create repository"**

---

### Step 3: Connect Your Local Project to GitHub

After creating the repo, GitHub will show you commands. Use these:

**In PowerShell (in your project folder):**

```powershell
# Add GitHub as remote
git remote add origin https://github.com/YOUR-USERNAME/sayamoe.git

# Rename branch to main (GitHub standard)
git branch -M main

# Push your code to GitHub (first time)
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

**Example:**
If your GitHub username is `john123`, the command would be:
```powershell
git remote add origin https://github.com/john123/sayamoe.git
```

---

### Step 4: Authentication

When you first push, GitHub will ask for authentication. You have two options:

#### Option A: Use GitHub Desktop (Easiest)
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in
3. It handles authentication automatically

#### Option B: Personal Access Token (Command line)
1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Generate new token (classic)
3. Give it a name like "Sayamoe LMS"
4. Check **"repo"** scope
5. Generate token and **COPY IT** (you won't see it again!)
6. When prompted for password, paste the token

---

### Step 5: Verify It Worked

After pushing, check:
1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your code files!

---

## 🔄 Daily Backup Workflow

**After this setup, backing up is easy:**

```powershell
# Make changes to your code...

# Save to Git
git add .
git commit -m "description of what you did"

# Backup to GitHub
git push
```

**That's it!** Your code is now safely backed up in the cloud.

---

## 🚨 Important Files to Ignore

Before pushing, make sure `.env.local` is in `.gitignore` (it already should be).

**Check your `.gitignore` file includes:**
```
.env.local
.env*.local
node_modules/
.next/
```

**Why?** These files contain:
- Secret keys (Firebase credentials)
- Dependencies (node_modules can be reinstalled)
- Build files (.next can be regenerated)

---

## 📋 Quick Commands Reference

```powershell
# One-time setup
git remote add origin https://github.com/username/sayamoe.git
git branch -M main
git push -u origin main

# Daily use
git add .
git commit -m "message"
git push

# Check remote
git remote -v

# Pull latest from GitHub (if working on multiple computers)
git pull
```

---

## ✅ You're Done!

After setup, you can:
- ✅ Access your code from anywhere
- ✅ See full history of changes on GitHub
- ✅ Never worry about losing work
- ✅ Share the repo with collaborators

---

## 🆘 Troubleshooting

**"Permission denied"**
→ Check your authentication (use GitHub Desktop or create Personal Access Token)

**"Repository not found"**
→ Make sure the URL matches your GitHub username and repo name

**"Failed to push"**
→ Try: `git pull --rebase` then `git push` again

**Want to start over?**
```powershell
git remote remove origin
# Then follow Step 3 again
```
