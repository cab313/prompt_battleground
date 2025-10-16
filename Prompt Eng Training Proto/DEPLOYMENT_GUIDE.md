# 🚀 Deployment Guide - Internal Team Sharing

This guide explains how to deploy the Prompt Engineering Battle Royale application so your teammates can access it via an internal link.

## 📋 Prerequisites

Before deploying, ensure you have:
- All application files in the `Prompt Eng Training Proto` folder
- Git installed on your machine (for GitHub deployment)
- Access to your company's internal hosting or GitHub Enterprise

---

## 🎯 Recommended Option: GitHub Pages (GitHub Enterprise)

This is the **best option** for internal company use as it provides:
- ✅ Single URL that everyone can access
- ✅ Version control and change tracking
- ✅ Automatic updates when you push changes
- ✅ Secure access within company network
- ✅ No server maintenance required

### Step-by-Step Setup:

#### 1. Create a GitHub Enterprise Repository

```bash
# Navigate to your project folder
cd "/Users/cbrondon/Downloads/Prompt Eng Training Proto"

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Prompt Engineering Battle Royale"
```

#### 2. Push to GitHub Enterprise

```bash
# Add your GitHub Enterprise remote (replace with your actual URL)
git remote add origin https://github.yourcompany.com/your-username/prompt-battle-royale.git

# Push to main branch
git push -u origin main
```

#### 3. Enable GitHub Pages

1. Go to your repository on GitHub Enterprise
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 2-3 minutes for deployment

#### 4. Get Your Internal Link

Your application will be available at:
```
https://github.yourcompany.com/pages/your-username/prompt-battle-royale/
```

Or:
```
https://your-username.github.yourcompany.com/prompt-battle-royale/
```

**Share this link with your teammates!** 🎉

---

## 🌐 Alternative Option 1: Internal Web Server

If your company has an internal web server:

### Step 1: Package the Application

```bash
# Create a zip file of all project files
cd "/Users/cbrondon/Downloads"
zip -r prompt-battle-royale.zip "Prompt Eng Training Proto"
```

### Step 2: Deploy to Web Server

1. Contact your IT department or DevOps team
2. Request web server space for the application
3. Upload all files to the server directory
4. Ensure the web server serves the `index.html` file

### Step 3: Access URL

Your IT team will provide an internal URL like:
```
http://internalserver.yourcompany.com/prompt-battle-royale/
```

---

## 🗂️ Alternative Option 2: Shared Network Drive

**Note:** This method has limitations (may not work in all browsers due to security restrictions).

### Step 1: Copy to Shared Drive

```bash
# Copy entire folder to shared network location
cp -r "/Users/cbrondon/Downloads/Prompt Eng Training Proto" "/Volumes/SharedDrive/Apps/"
```

### Step 2: Access Path

Teammates can open:
```
file:///Volumes/SharedDrive/Apps/Prompt Eng Training Proto/index.html
```

**Limitations:**
- ❌ May not work in all browsers (CORS restrictions)
- ❌ Users must have network drive mounted
- ❌ Slower loading times
- ✅ No server required

---

## ☁️ Alternative Option 3: Cloud Hosting (If Approved)

If external hosting is approved by your company:

### Netlify (Easiest)

1. Go to [netlify.com](https://www.netlify.com)
2. Sign up/login
3. Drag and drop your project folder
4. Get instant URL: `https://your-app.netlify.app`

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd "/Users/cbrondon/Downloads/Prompt Eng Training Proto"
   vercel
   ```

3. Follow prompts and get URL

---

## 🔄 Updating the Application

### For GitHub Pages:

```bash
# Make your changes, then:
git add .
git commit -m "Update: description of changes"
git push origin main

# GitHub Pages will auto-deploy in 2-3 minutes
```

### For Internal Web Server:

1. Make changes locally
2. Create new zip file
3. Upload to server (overwrite old files)
4. Teammates refresh browser to see updates

---

## 📢 Sharing with Your Team

### Create a Team Announcement

Once deployed, share with your team:

```
📣 Team Announcement: Prompt Engineering Training Game 🎮

Hey team! We've deployed an interactive Prompt Engineering Battle Royale
training application. Start playing to improve your AI prompt skills!

🔗 Access Link: [YOUR_DEPLOYED_URL_HERE]

🎯 What it is:
- Interactive prompt engineering training
- Real-world feedback classification scenarios
- Score-based competition with leaderboard
- Level up system and achievements

🚀 Getting Started:
1. Click the link above
2. Create your profile (choose an avatar!)
3. Complete the optional tutorial
4. Start your first battle!

💡 Features:
- 8 realistic scenarios
- Poor prompt examples to learn from
- Battle history to review your work
- Export/sync data for team leaderboard

📊 Leaderboard:
We'll be updating the shared leaderboard weekly. Export your data using
the button in the lobby and share it with me.

Questions? Check the README or reach out!

Happy battling! May the best prompt win! 🏆
```

---

## 🔐 Security Considerations

### For GitHub Enterprise:
- ✅ Access restricted to company employees
- ✅ Authentication required via SSO
- ✅ All traffic within company network
- ✅ API key safe (internal use only)

### For Internal Web Server:
- ✅ Behind company firewall
- ✅ VPN required for remote access
- ✅ No external exposure

### Important Notes:
- The API key in `config.js` is for internal company use
- Application runs client-side (no sensitive data stored on server)
- User data stored in browser LocalStorage (local to each user)

---

## 🧪 Testing Your Deployment

Before announcing to team:

1. **Access Test**: Open the deployed URL in an incognito window
2. **Functionality Test**:
   - Create a profile
   - Complete one battle
   - Check all screens load correctly
3. **Multi-Device Test**: Try on desktop and mobile
4. **Network Test**: Have a colleague try accessing from their machine

---

## 📞 Getting Help

### Common Issues:

**Issue: "Page not found" on GitHub Pages**
- Solution: Wait 5 minutes after enabling Pages, then clear browser cache

**Issue: API calls failing**
- Solution: Check browser console, ensure API endpoint is accessible from company network

**Issue: Avatars not loading**
- Solution: Check internet connection, the avatars use external CDN (dicebear.com)

**Issue: LocalStorage not working**
- Solution: Check browser privacy settings, ensure cookies/storage allowed

### Support Resources:

1. Check the main `README.md` file
2. Review browser console for errors (F12)
3. Contact IT/DevOps for server issues
4. Reach out to the training administrator

---

## 🎉 Success Metrics

Track adoption and engagement:
- Number of active players
- Battles completed
- Average scores
- Leaderboard participation
- Feedback from participants

---

## 📝 Maintenance

### Regular Tasks:

**Weekly:**
- Update shared leaderboard with team data
- Announce top performers
- Share interesting prompt examples

**Monthly:**
- Review analytics (Google Analytics dashboard)
- Gather feedback for improvements
- Consider adding new scenarios

**As Needed:**
- Fix bugs reported by users
- Update scenarios based on feedback
- Add new features requested by team

---

## 🎓 Training Tips

### For Best Results:

1. **Launch Event**: Host a kickoff session to introduce the game
2. **Weekly Challenges**: Create weekly competitions
3. **Share Learnings**: Post great prompts in team channel
4. **Celebrate Winners**: Recognize top performers
5. **Continuous Content**: Add new scenarios regularly

---

## 📞 Quick Reference

| Method | Ease | Best For | URL Type |
|--------|------|----------|----------|
| GitHub Pages | ⭐⭐⭐⭐⭐ | Most teams | Internal HTTPS |
| Internal Server | ⭐⭐⭐ | Large orgs | Internal HTTP |
| Network Drive | ⭐⭐ | Small teams | File path |
| Cloud Hosting | ⭐⭐⭐⭐ | If approved | Public HTTPS |

**Recommended: GitHub Pages (GitHub Enterprise)** ✅

---

## 🚀 Next Steps

1. Choose your deployment method (GitHub Pages recommended)
2. Follow the step-by-step instructions above
3. Test the deployment thoroughly
4. Share the link with your team
5. Set up weekly leaderboard updates
6. Gather feedback and iterate

**Good luck with your deployment! Your team will love this training tool! 🎉**

---

*Questions? Check the main README.md or LEADERBOARD_INSTRUCTIONS.md for more details.*
