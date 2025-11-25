# 🤖 Ollama Installation Guide for AI Summaries

This guide will help you install Ollama on your Mac to enable AI-powered narrative summaries in the DCSC Attendance Dashboard.

---

## What is Ollama?

Ollama is a tool that lets you run large language models (AI) **locally on your computer** - no internet required, no API keys, completely private and free!

The dashboard uses Ollama to generate intelligent, narrative summaries of your attendance data.

---

## ✅ Quick Installation (Mac)

### Step 1: Download Ollama

1. **Open your web browser** and go to:
   ```
   https://ollama.com/download
   ```

2. **Click "Download for macOS"**
   - The file is about 300-400 MB, so it may take a few minutes

3. **Find the downloaded file** (usually in your Downloads folder)
   - It will be named: `Ollama-darwin.zip`

### Step 2: Install Ollama

1. **Double-click** `Ollama-darwin.zip` to extract it

2. **Drag the Ollama app** to your Applications folder

3. **Open Applications** folder and **double-click Ollama**

4. **First time opening:** macOS may warn you about opening an app from the internet
   - Click "Open" when prompted
   - Or go to System Preferences → Security & Privacy → Click "Open Anyway"

5. **Ollama will launch** - you'll see an icon in your menu bar (top right)

6. **Install a Model** - The first time, you need to download an AI model:

   **Open Terminal** (Command + Space, type "Terminal") and run:
   ```bash
   ollama pull llama3.2
   ```
   
   This downloads a free, open-source model (about 2GB). It takes 5-10 minutes depending on your internet speed.

   **Alternative models** (if llama3.2 doesn't work):
   ```bash
   ollama pull mistral      # Smaller, faster
   ollama pull qwen2.5      # Another good option
   ```

### Step 3: Verify Installation

1. **In Terminal, test Ollama:**
   ```bash
   ollama list
   ```
   
   You should see the model you just downloaded (e.g., `llama3.2`)

2. **Test that it's running:**
   ```bash
   ollama run llama3.2 "Say hello"
   ```
   
   It should respond with a greeting!

---

## 🚀 Start Ollama (Every Time You Use the Dashboard)

### Automatic (Recommended)

**Ollama should start automatically** when you open the app. Check your menu bar (top right) for the Ollama icon.

If it's not running:

1. **Open Applications** folder
2. **Double-click Ollama** to start it
3. Wait 5-10 seconds for it to fully start

### Manual (Terminal)

Or start it from Terminal:
```bash
ollama serve
```

Leave this terminal window open while using the dashboard.

---

## ✅ Verify Ollama is Running

### Method 1: Check Menu Bar

Look at the top-right of your screen. You should see the **Ollama icon** (looks like a llama or a robot head).

### Method 2: Test in Terminal

Run this command:
```bash
curl http://localhost:11434/api/tags
```

If it returns JSON data (lists of models), Ollama is running! ✅

### Method 3: Test in Browser

Open this URL in your browser:
```
http://localhost:11434
```

If you see "Ollama is running", you're good! ✅

---

## 🎯 Using AI Summaries in the Dashboard

Once Ollama is installed and running:

1. **Start your dashboard:**
   ```bash
   ./run.sh
   ```

2. **Upload your attendance CSV file**

3. **Navigate to any tab** (Overview, Teams, Players, Trends)

4. **Click "Generate Summary"** in the AI Insights box

5. **Wait 10-30 seconds** for the AI to analyze and generate insights

6. **Read the narrative summary!** 📖

---

## 📦 Recommended Models

The dashboard works with several models. Here are recommendations:

### Best Balance (Recommended): `llama3.2`
```bash
ollama pull llama3.2
```
- **Size:** ~2GB
- **Speed:** Good
- **Quality:** Excellent summaries
- **Best for:** Most users

### Smaller/Faster: `mistral`
```bash
ollama pull mistral
```
- **Size:** ~4GB
- **Speed:** Very fast
- **Quality:** Good summaries
- **Best for:** If you want faster responses

### Alternative: `qwen2.5`
```bash
ollama pull qwen2.5
```
- **Size:** ~1.5GB
- **Speed:** Fast
- **Quality:** Very good
- **Best for:** Lower-end Macs

### How to Switch Models

The dashboard automatically detects available models. To use a different model:

1. Make sure you've downloaded it:
   ```bash
   ollama pull MODEL_NAME
   ```

2. The dashboard will try models in this order:
   - llama3.2
   - mistral
   - qwen2.5
   - llama3.1
   - llama2

---

## 🔧 Troubleshooting

### Problem: "AI Service Not Available"

**Solution 1:** Make sure Ollama is running
- Check the menu bar for the Ollama icon
- If not there, open Ollama from Applications

**Solution 2:** Verify Ollama is accessible
```bash
curl http://localhost:11434/api/tags
```
If this fails, Ollama isn't running properly.

**Solution 3:** Restart Ollama
- Quit Ollama (right-click menu bar icon → Quit)
- Open it again from Applications

---

### Problem: "Model not found"

**Solution:** Download the model
```bash
ollama pull llama3.2
```
Wait for it to finish (5-10 minutes), then try again.

---

### Problem: "Connection refused" or "Connection timeout"

**Causes:**
- Ollama isn't running
- Firewall blocking localhost connections
- Port 11434 is in use

**Solutions:**
1. **Check Ollama is running** (menu bar icon)
2. **Restart Ollama:**
   - Quit completely
   - Open again
   - Wait 10 seconds
3. **Check firewall settings:**
   - System Preferences → Security & Privacy → Firewall
   - Make sure Ollama is allowed

---

### Problem: Very slow responses (30+ seconds)

**Solutions:**
1. **Use a smaller model:**
   ```bash
   ollama pull mistral
   ```
   
2. **Close other applications** to free up memory

3. **Check available RAM:**
   - Ollama needs at least 4GB free RAM
   - Activity Monitor → Memory tab

---

### Problem: "Out of memory" error

**Solution:** 
- Use a smaller model (e.g., `mistral` instead of `llama3.2`)
- Close other applications
- Restart your Mac if needed

---

### Problem: Ollama icon not in menu bar

**Solution:**
- Ollama might be running but icon is hidden
- Check Activity Monitor for "Ollama" process
- If not running, open from Applications

---

## 💾 Disk Space Requirements

**Minimum:**
- Ollama app: ~100 MB
- Model (llama3.2): ~2 GB
- **Total: ~2.1 GB**

**Recommended:**
- At least 5 GB free space
- More if you want multiple models

---

## 🔄 Updating Ollama

Ollama updates automatically, but you can manually update:

1. **Download the latest version** from https://ollama.com/download
2. **Replace the old Ollama** in Applications folder
3. **Restart Ollama**

Your models stay installed, so no need to re-download them!

---

## 🗑️ Uninstalling Ollama

If you want to remove Ollama:

1. **Quit Ollama** (right-click menu bar icon → Quit)

2. **Delete the app:**
   - Applications → Right-click Ollama → Move to Trash

3. **Delete models (optional):**
   ```bash
   rm -rf ~/.ollama
   ```

---

## 📚 Additional Resources

- **Ollama Official Website:** https://ollama.com
- **Ollama Documentation:** https://github.com/ollama/ollama
- **List of Available Models:** https://ollama.com/library
- **Community Support:** https://github.com/ollama/ollama/discussions

---

## ⚡ Quick Reference Commands

```bash
# Download a model
ollama pull llama3.2

# List installed models
ollama list

# Test a model
ollama run llama3.2 "Hello"

# Start Ollama server
ollama serve

# Check if running
curl http://localhost:11434/api/tags
```

---

## ✅ Installation Checklist

Before using AI summaries:

- [ ] Ollama downloaded and installed
- [ ] Ollama app is in Applications folder
- [ ] Ollama is running (check menu bar)
- [ ] At least one model downloaded (`llama3.2` recommended)
- [ ] Tested with `ollama run llama3.2 "Hello"`
- [ ] Dashboard can connect (click "Generate Summary" in any tab)

---

## 🎉 You're Ready!

Once you've completed the checklist above, you can:

1. **Start your dashboard** (`./run.sh`)
2. **Upload attendance data**
3. **Click "Generate Summary"** on any tab
4. **Enjoy AI-powered insights!** 🤖✨

---

## 💡 Tips

1. **Keep Ollama running** while using the dashboard
2. **First summary takes longer** (model warming up) - subsequent ones are faster
3. **Try different models** to see which you prefer
4. **The AI works offline** - no internet needed after installation!

---

**Questions?** Check the troubleshooting section above or visit the Ollama documentation!

**Happy analyzing!** ⚽🤖

