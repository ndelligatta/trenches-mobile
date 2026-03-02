# Google Play Data Safety Form Guide

## App: Trenches (com.trenchesgame)

Use this guide to fill out the Play Console Data Safety form.

---

## Data Collection & Sharing

### Financial info
- **Purchase history**: Yes, collected
  - Purpose: App functionality (track which items a player owns)
  - Shared with third parties: No
  - Required: Yes
  - Encrypted in transit: Yes (HTTPS/TLS)
  - Can users request deletion: Yes (contact support)

### Identifiers
- **Other identifiers (wallet address)**: Yes, collected
  - Purpose: App functionality (player identification, transaction verification)
  - Shared with third parties: No (only sent to our Supabase backend)
  - Required: Yes
  - Encrypted in transit: Yes (HTTPS/TLS)
  - Can users request deletion: Yes (contact support)

### App activity
- **In-app search history**: No
- **Other user-generated content**: No
- **Other actions**: Yes, collected
  - Purpose: App functionality (game stats: wins, kills, games played)
  - Shared with third parties: No
  - Encrypted in transit: Yes (HTTPS/TLS)

---

## Data NOT Collected

Check "No" for all of the following:

- **Location**: Not collected (no location permissions)
- **Personal info** (name, email, address, phone): Not collected (identity is wallet address only)
- **Contacts**: Not collected
- **Photos/Videos**: Not collected
- **Audio**: Not collected
- **Files and docs**: Not collected
- **Calendar**: Not collected
- **Messages**: Not collected
- **Health and fitness**: Not collected
- **Web browsing history**: Not collected
- **Device identifiers**: Not collected
- **Diagnostics**: Not collected

---

## Security Practices

- **Is all data encrypted in transit?**: Yes (all API calls use HTTPS, network security config enforces cleartext=false)
- **Do you provide a way for users to request data deletion?**: Yes (users can contact support to request account deletion)
- **Does your app follow Google's Families Policy?**: N/A (not a kids app)

---

## Play Console Checkbox Summary

| Category | Data Type | Collected | Shared | Purpose |
|----------|-----------|-----------|--------|---------|
| Financial | Purchase history | Yes | No | App functionality |
| Identifiers | Wallet address | Yes | No | App functionality |
| App activity | Game stats | Yes | No | App functionality |
| Location | - | No | - | - |
| Personal info | - | No | - | - |
| Device info | - | No | - | - |

---

## Legal Links (for Play Console Store Listing)

- **Privacy Policy:** https://trenchesgame.com/privacy.html
- **Terms of Service:** https://trenchesgame.com/terms.html
