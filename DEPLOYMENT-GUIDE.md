# VIREVO CHATBOT - DEPLOYMENT GUIDE
## Step-by-Step Instructions to Get Tojo Live

---

## 📦 STEP 1: PREPARE FILES FOR VERCEL

You need to organize all files in a folder structure.

**Create this structure on your computer:**

```
virevo-chatbot/
├── api/
│   └── chat.js
├── knowledge/
│   ├── 01-bot-personality.md
│   ├── 02-virevo-overview.md
│   ├── 03-healthworks.md
│   ├── 04-guestworks.md
│   ├── 05-bismara.md
│   ├── 06-founder-mascot.md
│   └── 07-booking-flow.md
├── package.json
├── vercel.json
└── .env.example
```

**All these files have been created for you - download them from the outputs.**

**Note**: `virevo-chatbot-widget.html` is separate - you'll paste it into Wix later.

---

## 🚀 STEP 2: DEPLOY TO VERCEL

### Option: Using Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/dashboard

2. Click **"Add New"** → **"Project"**

3. Click **"Browse"** and select your `virevo-chatbot` folder
   (Or drag and drop the folder)

4. Settings:
   - Project Name: `virevo-chatbot`
   - Framework: Other
   - Root Directory: `./`
   - Keep defaults

5. Click **"Deploy"**

6. Wait 1-2 minutes

7. **COPY YOUR URL**: `https://virevo-chatbot-xxxxx.vercel.app`
   **SAVE THIS!**

---

## 🔑 STEP 3: ADD API KEY TO VERCEL

1. In Vercel dashboard, click your project

2. Go to **"Settings"** tab

3. Click **"Environment Variables"**

4. Add variable:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-api03-xxxxx` (your API key)
   - **Environments**: Check ALL three boxes

5. Click **"Save"**

6. **CRITICAL**: Go to **"Deployments"** tab
   - Click three dots on latest deployment
   - Click **"Redeploy"**
   - Wait 1-2 minutes

---

## ✏️ STEP 4: UPDATE CHATBOT CODE

1. Open `virevo-chatbot-widget.html`

2. Find line 668:
   ```javascript
   apiEndpoint: 'YOUR_VERCEL_URL_HERE/chat',
   ```

3. Replace with:
   ```javascript
   apiEndpoint: 'https://virevo-chatbot-xxxxx.vercel.app/chat',
   ```
   (Use YOUR actual Vercel URL + `/chat`)

4. Save file

---

## 🌐 STEP 5: ADD TO WIX

1. Open Wix Editor for virevo.works

2. Go to **Settings** → **Custom Code**

3. Click **"+ Add Custom Code"**

4. Settings:
   - Name: `Tojo Chatbot`
   - Code: Paste ENTIRE `virevo-chatbot-widget.html` content
   - Add code to: **All pages**
   - Place in: **Body - end**
   - Load once: ✅ Yes

5. Click **"Apply"**

6. Click **"Preview"** to test

---

## 🔗 STEP 6: LINK BUTTONS

1. Find "Talk to Tojo" buttons in Wix

2. Note each button's ID (Properties → ID)

3. Add new Custom Code:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const buttonIds = ['button1', 'button2']; // YOUR IDs HERE
        
        buttonIds.forEach(function(id) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.openTojoChat) {
                        window.openTojoChat();
                    }
                });
            }
        });
    }, 2000);
});
</script>
```

4. Settings:
   - Name: `Tojo Button Links`
   - All pages, Body - end

5. Click **"Apply"**

---

## ✅ STEP 7: TEST & PUBLISH

1. Test in Preview:
   - Tojo appears
   - Chat works
   - Buttons open chat

2. Click **"Publish"**

3. Test on live site

---

## 🎉 DONE!

Your chatbot is live at virevo.works!

**Monitor usage**: console.anthropic.com

**Update knowledge**: Edit files in Vercel, auto-deploys in 30 seconds
