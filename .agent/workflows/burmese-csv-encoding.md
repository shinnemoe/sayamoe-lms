---
description: How to save CSV files with Burmese text properly
---

# Fixing Burmese Font Display Issues in CSV

## 🐛 Problem
Burmese text shows as "?????????" when uploading CSV files.

## ✅ Solution
The CSV file must be saved with **UTF-8 encoding**.

---

## 📝 How to Save CSV as UTF-8

### Option 1: Using Excel

1. **Create your CSV in Excel** with Burmese text
2. Click **File → Save As**
3. Choose **"CSV UTF-8 (Comma delimited) (.csv)"** from the dropdown
4. Save the file

**Important:** Regular "CSV (Comma delimited)" won't work! You must use **"CSV UTF-8"**.

---

### Option 2: Using Google Sheets (Recommended)

1. Create your spreadsheet in Google Sheets
2. Type Burmese text normally
3. Go to **File → Download → Comma Separated Values (.csv)**
4. Google Sheets automatically saves as UTF-8!

---

### Option 3: Using Notepad (Windows)

If you're editing an existing CSV file:

1. Open the CSV file with **Notepad**
2. Go to **File → Save As**
3. At the bottom, change **Encoding** dropdown to **"UTF-8"**
4. Click **Save**

---

### Option 4: Using VS Code

1. Open your CSV file in VS Code
2. Look at the bottom-right corner - it shows the current encoding
3. Click on it (e.g., "ANSI" or "Windows-1252")
4. Select **"Save with Encoding"**
5. Choose **"UTF-8"**
6. File is now properly encoded!

---

## 🧪 Testing

After saving as UTF-8:

1. Upload the CSV in the admin dashboard
2. Go to student side
3. Take the unscramble quiz
4. Burmese text should display correctly: **သူတို့** instead of **?????**

---

## 📋 Example CSV Content

**unscramble_template.csv** (save as UTF-8):
```csv
prompt,answer
စာလုံးများကို စီပါ,သူတို့က နွားများ ဖြစ်သည်
```

**multiple_choice_template.csv** (save as UTF-8):
```csv
question,answer,distractor1,distractor2,distractor3
သူတို့က _____ ဖြစ်သည်,နွားများ,ကြက်များ,ဝက်များ,ဆိုတ်များ
```

---

## ✅ Fixed!

The app now:
- ✅ Reads CSV files as UTF-8 (Papa.parse with encoding)
- ✅ Downloads templates as UTF-8 (Blob with charset=utf-8)
- ✅ Has Noto Sans Myanmar font loaded in CSS
- ✅ Properly displays Burmese text in all quiz types

---

## 🚨 Common Mistakes

❌ **Wrong:** Saving as "CSV (Comma delimited)" in Excel → Uses Windows-1252 encoding
✅ **Right:** Saving as "CSV UTF-8 (Comma delimited)" in Excel

❌ **Wrong:** Opening CSV in Excel and re-saving normally → Loses UTF-8
✅ **Right:** Use Google Sheets or save as UTF-8 explicitly

---

## 💡 Pro Tip

**Best practice:** Always use **Google Sheets** for Burmese content, then download as CSV. It handles UTF-8 automatically!
