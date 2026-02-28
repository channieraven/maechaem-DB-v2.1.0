# Cloud Functions for Mae Chaem Tree Database

Firebase Cloud Functions that provide backend functionality for user management, data aggregation, and automated tasks.

## 📋 Functions Overview

### Active Functions

#### `onUserCreate`
**Trigger:** Firebase Auth user creation (beforeUserCreated)  
**Purpose:** Automatically create user profile document in Firestore

**Behavior:**
- **First user**: Assigned `role="admin"` and `approved=true` (bootstrap admin account)
- **Subsequent users**: Assigned `role="pending"` and `approved=false` (require manual approval)
- Sets custom claims for role-based access control (RBAC)
- Extracts display name from email address

**Why it's needed:**
- Eliminates race condition in client-side "first user check"
- Ensures profile document is created atomically with auth account
- Enables immediate RBAC enforcement via custom claims

#### `onProfileUpdate`
**Trigger:** Firestore document creation in `profiles/{userId}`  
**Purpose:** Sync role/approval changes to Firebase Auth custom claims

**Behavior:**
- When admin updates user role or approval status in Firestore
- Automatically updates the user's custom claims
- Enables Security Rules to enforce access control without re-login

**Why it's needed:**
- Security Rules can check `request.auth.token.role` and `request.auth.token.approved`
- Avoids requiring users to logout/login after approval

### Commented Out Functions (Optional)

#### `updatePlotTreeCount`
**Trigger:** Firestore document write in `trees/{treeId}`  
**Purpose:** Maintain denormalized `tree_count` field in plots

**Status:** Commented out for Phase 1  
**Reasoning:** Client-side counting is acceptable for <100 plots. Deploy only if performance becomes an issue.

#### `updatePlotAliveCount`  
**Trigger:** Firestore document creation in `growth_logs/{logId}`  
**Purpose:** Maintain denormalized `alive_count` field in plots

**Status:** Commented out for Phase 1  
**Reasoning:** Complex logic requiring "latest status per tree" analysis. Recommend scheduled Cloud Function or client-side computation.

---

## 🚀 Deployment

### Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Authenticated: `firebase login`
3. Project selected: `firebase use <project-id>`

### Deploy All Functions
```bash
cd functions
npm run build
firebase deploy --only functions
```

### Deploy Specific Function
```bash
firebase deploy --only functions:onUserCreate
```

### Test Locally (Emulator)
```bash
cd functions
npm run serve
# Functions emulator runs on http://localhost:5001
```

---

## 🛠️ Development

### Build TypeScript
```bash
cd functions
npm run build
```

### Watch Mode (Auto-rebuild)
```bash
cd functions
npm run build:watch
```

### Lint Code
```bash
cd functions
npm run lint
```

### View Logs
```bash
firebase functions:log
```

### View Logs for Specific Function
```bash
firebase functions:log --only onUserCreate
```

---

## 🔐 Security & Permissions

### Required Firebase Permissions
- **Authentication API**: Enabled (for custom claims)
- **Firestore**: Read/write access to `profiles` collection
- **IAM Role**: `roles/editor` or `roles/firebase.admin`

### Environment Variables
None required for Phase 1. All configuration is inherited from Firebase project settings.

---

## 📊 Cost Estimates (Free Tier)

### Spark Plan (Free)
- ❌ **Cloud Functions NOT included** in free tier
- Requires upgrade to **Blaze Plan (pay-as-you-go)**

### Blaze Plan (Pay-as-you-go)
Monthly free tier allowances:
- **2M invocations/month** (onUserCreate: ~10/month for active registration)
- **400,000 GB-seconds compute time**
- **200,000 GHz-seconds compute time**
- **5GB outbound networking**

**Expected monthly cost for Phase 1:** ~฿0-10 THB (~$0-0.30 USD)
- Assumption: 10 new users/month, minimal function duration

---

## 🐛 Troubleshooting

### Error: "Billing account not configured"
**Solution:** Upgrade project to Blaze Plan at https://console.firebase.google.com

### Error: "Missing custom claims"
**Solution:** 
1. Check function logs: `firebase functions:log --only onUserCreate`
2. Manually set claims:
```typescript
await admin.auth().setCustomUserClaims(userId, { role: 'admin', approved: true });
```

### Error: "Profile document not created"
**Solution:**
1. Check Firestore Security Rules allow function to write to `profiles`
2. Verify Firebase Admin SDK is initialized
3. Check function logs for detailed error messages

### Custom Claims Not Working in Client
**Solution:** Force token refresh after role change:
```typescript
await user.getIdToken(true); // force refresh
```

---

## 📝 Code Structure

```
functions/
├── src/
│   └── index.ts          # All Cloud Functions (user management, aggregation)
├── lib/                  # Compiled JavaScript (generated by tsc)
├── package.json          # Dependencies (firebase-admin, firebase-functions)
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

---

## 🔄 Migration Notes

### From Supabase
Firebase Cloud Functions replace:
- ✅ Supabase Triggers: `handle_new_user()` → `onUserCreate`
- ✅ Supabase RPCs: `get_plot_summaries()` → Client-side (Phase 1) or `getPlotSummaries` callable function (Phase 2)
- ✅ Row Level Security (RLS): Firestore Security Rules with custom claims

### Key Differences
1. **No SQL**: Cloud Functions use Firestore SDK (NoSQL operations)
2. **Custom Claims**: More powerful than Supabase JWT claims (can update without re-login)
3. **Billing**: Functions not included in free tier (Blaze Plan required)

---

## 📚 Resources

- [Firebase Functions v2 Docs](https://firebase.google.com/docs/functions)
- [Identity Triggers (Auth)](https://firebase.google.com/docs/functions/auth-events)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Custom Claims Guide](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Functions Pricing](https://firebase.google.com/pricing)
