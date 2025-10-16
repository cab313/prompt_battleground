# 🏆 Leaderboard Sharing Instructions

This guide explains how to share leaderboard data across your team members so everyone can see the competitive rankings.

## 📊 How the Leaderboard Works

The application stores each player's data locally in their browser. To create a shared leaderboard that everyone can see, team members need to sync their data together.

## 🔄 Method 1: Manual Sync (Current Implementation)

### Step 1: Export Your Data
1. Click the **"📤 Export My Data"** button in the lobby
2. A JSON file will download with your stats (e.g., `yourname_battle_data_1234567890.json`)
3. Save this file somewhere accessible

### Step 2: Share with Team Lead
1. Send your exported JSON file to the designated team lead via:
   - Slack/Teams
   - Email
   - Shared drive (Google Drive, OneDrive, etc.)

### Step 3: Team Lead Consolidates Data
The team lead will:
1. Collect all team members' exported JSON files
2. Open `/data/shared-leaderboard.json` in a text editor
3. Manually add each player's data to the `players` array:

```json
{
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "players": [
        {
            "username": "Player1",
            "avatarUrl": "https://...",
            "teamName": "Team Alpha",
            "level": 3,
            "xp": 450,
            "totalBattles": 15,
            "totalWins": 10,
            "perfectScores": 2,
            "bestScore": 9.5,
            "lastUpdated": "2024-01-15T10:30:00.000Z"
        },
        {
            "username": "Player2",
            "avatarUrl": "https://...",
            "teamName": "Team Alpha",
            "level": 2,
            "xp": 250,
            "totalBattles": 10,
            "totalWins": 6,
            "perfectScores": 1,
            "bestScore": 8.5,
            "lastUpdated": "2024-01-15T09:15:00.000Z"
        }
    ]
}
```

### Step 4: Redistribute Updated File
1. Team lead shares the updated `shared-leaderboard.json` file with all team members
2. Each team member replaces their local copy of the file
3. Team members click **"🔄 Sync Leaderboard"** button in the lobby
4. Everyone can now see the full leaderboard by clicking **"Leaderboard"**

### Step 5: Regular Updates
- Repeat this process weekly or after major battles
- Team members export their latest data
- Team lead consolidates and redistributes

## 🚀 Method 2: Shared GitHub Repository (Recommended for Tech Teams)

### Setup
1. Create a GitHub repository for the application
2. All team members clone the repository
3. Set up the application in the repository

### Workflow
1. **After battles**, each player:
   - Exports their data
   - Creates a PR updating `shared-leaderboard.json` with their stats

2. **Team lead reviews and merges PRs**

3. **All players pull latest changes**:
   ```bash
   git pull origin main
   ```

4. **Click "🔄 Sync Leaderboard"** in the app

### Benefits
- Version controlled
- Automatic conflict resolution
- Full audit trail
- Everyone always has latest data

## 🌐 Method 3: GitHub Pages Deployment (Best for Ongoing Use)

### Setup (One-time)
1. Push the application to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Share the GitHub Pages URL with team (e.g., `https://yourorg.github.io/prompt-battle/`)

### Workflow
1. Each player uses the deployed version at the same URL
2. When ready to update leaderboard:
   - Export data
   - Team lead updates `shared-leaderboard.json` in the repository
   - Commit and push changes
   - GitHub Pages auto-deploys
3. Players refresh the page and click "🔄 Sync Leaderboard"

### Benefits
- Everyone uses the same version
- Single source of truth
- Easy to update centrally
- No file distribution needed

## 💡 Method 4: Google Sheets Integration (Future Enhancement)

For automatic real-time syncing, you could integrate with Google Sheets API:

1. Create a Google Sheet for the leaderboard
2. Each player's browser would write to the sheet via API
3. Leaderboard would read from the sheet automatically
4. No manual sync required

**Note**: This requires additional setup and Google API credentials.

## 📝 Best Practices

### For Players
- Export your data regularly (at least weekly)
- Use consistent usernames (no special characters)
- Share exports promptly with team lead

### For Team Leads
- Set a regular schedule for leaderboard updates (e.g., every Monday)
- Keep backup copies of `shared-leaderboard.json`
- Announce leaderboard updates to the team
- Celebrate top performers!

### For Teams
- Decide on a primary sharing method and stick to it
- Document your specific workflow
- Set expectations for update frequency
- Consider using team channels for announcements

## 🔍 Troubleshooting

### "Leaderboard is empty"
- Click "🔄 Sync Leaderboard" first
- Ensure `shared-leaderboard.json` has data
- Check browser console for errors (F12)

### "My data isn't showing"
- Make sure you clicked "🔄 Sync Leaderboard"
- Verify your username matches what's in the shared file
- Clear browser cache and try again

### "Leaderboard shows old data"
- Get the latest `shared-leaderboard.json` from team lead
- Replace your local copy
- Click "🔄 Sync Leaderboard" again
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### "JSON file has errors"
- Validate JSON at https://jsonlint.com
- Check for missing commas between entries
- Ensure all quotes are properly closed
- Make sure brackets and braces are balanced

## 🎯 Quick Reference

| Action | Button/Location |
|--------|----------------|
| Export your data | Lobby → "📤 Export My Data" |
| Sync leaderboard | Lobby → "🔄 Sync Leaderboard" |
| View leaderboard | Lobby → "Leaderboard" |
| Shared data file | `/data/shared-leaderboard.json` |

## 📧 Questions?

Contact your training administrator or tech lead for assistance with leaderboard setup and syncing.

---

**Remember**: The leaderboard is meant to be fun and motivational! Celebrate progress and learning, not just scores. 🎉
