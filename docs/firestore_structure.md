# Firestore Data Structure Documentation

This document describes the Firestore collections used in the Maechaem Tree Database.

## Collection Structure (Denormalized)

### 1. **users** Collection
- **Document ID**: Firebase Auth UID
- **Purpose**: Store user profiles and authentication data
- **Key Fields**:
  - Basic info: `email`, `displayName`, `role`, `isApproved`
  - Profile: `phoneNumber`, `organization`, `profileImageUrl`
  - Stats: Denormalized statistics (totalPlots, totalTrees, lastActiveAt)

### 2. **plots** Collection
- **Document ID**: plotCode (e.g., "P001")
- **Purpose**: Store plot/study area information
- **Key Fields**:
  - Location: `lat`, `lng`, `altitude`, `address`
  - Owner info (denormalized): `owner.uid`, `owner.displayName`, `owner.email`
  - Stats (denormalized): `stats.totalTrees`, `stats.totalSpecies`, etc.
  - Soil data (optional): pH, nitrogen, phosphorus, potassium

### 3. **trees** Collection
- **Document ID**: treeCode (e.g., "P001-T001")
- **Purpose**: Store individual tree data
- **Key Fields**:
  - Plot reference (denormalized): `plotCode`, `plotName`
  - Species info: `scientificName`, `commonNameThai`, `family`
  - Current measurements: `height`, `dbh`, `healthStatus` (latest data)
  - Coordinates: Position within plot (x, y) and GPS
  - Photos: Array of photo URLs with metadata
  - Stats (denormalized): `stats.totalGrowthLogs`, `stats.growthRate`

### 4. **growthLogs** Collection
- **Document ID**: Auto-generated
- **Purpose**: Historical growth measurements for trees
- **Key Fields**:
  - Tree reference (denormalized): `treeCode`, `treePlotCode`, `treeSpecies`
  - Measurements: `height`, `dbh`, `crownDiameter`, `healthStatus`
  - Environmental conditions: `temperature`, `humidity`, `weather`
  - Photos: Array of measurement photos
  - Recorded by (denormalized): `recordedBy.uid`, `recordedBy.displayName`

### 5. **surveys** Collection
- **Document ID**: Auto-generated
- **Purpose**: Store plot survey/inventory data
- **Key Fields**:
  - Plot reference (denormalized): `plotCode`, `plotName`, `plotArea`
  - Summary: Pre-calculated statistics (totalTrees, averageHeight, etc.)
  - Species distribution: Array of species counts and percentages
  - Conductor info (denormalized): Team members and leader

### 6. **activities** Collection
- **Document ID**: Auto-generated
- **Purpose**: Audit log for all system activities
- **Key Fields**:
  - Type: Action type (plot_created, tree_updated, etc.)
  - Actor (denormalized): User who performed the action
  - Target: Resource that was affected
  - Changes: Before/after snapshots (optional)
  - Metadata: IP address, user agent, location

### 7. **offlineQueue** Collection
- **Document ID**: userId/queueItems subcollection
- **Purpose**: Store offline changes for sync
- **Key Fields**:
  - Operation: create, update, or delete
  - Collection and document info
  - Data payload
  - Sync status: pending, syncing, failed, synced

### 8. **notifications** Collection
- **Document ID**: Auto-generated
- **Purpose**: User notifications
- **Key Fields**:
  - User ID: Recipient
  - Type: Notification category
  - Message and title
  - Related resource (optional)
  - Read status

## Composite Indexes

Firestore requires composite indexes for queries with multiple filters/sorts:

1. **trees**: `plotCode` (ASC) + `currentMeasurements.measuredAt` (DESC)
2. **trees**: `plotCode` (ASC) + `status` (ASC) + `createdAt` (DESC)
3. **growthLogs**: `treeCode` (ASC) + `recordedAt` (DESC)
4. **growthLogs**: `treePlotCode` (ASC) + `recordedAt` (DESC)
5. **surveys**: `plotCode` (ASC) + `surveyDate` (DESC)
6. **surveys**: `status` (ASC) + `surveyDate` (DESC)
7. **activities**: `actor.uid` (ASC) + `timestamp` (DESC)
8. **activities**: `target.type` (ASC) + `timestamp` (DESC)
9. **notifications**: `userId` (ASC) + `isRead` (ASC) + `createdAt` (DESC)
10. **notifications**: `userId` (ASC) + `createdAt` (DESC)

## Security Rules

- **Users**: Can read all, create own, update own (limited fields)
- **Plots/Trees/GrowthLogs**: Approved users can read, staff+ can write
- **Surveys**: Approved users can read, staff+ can write
- **Activities**: Read by approved users, write by admin only
- **Notifications**: Users can only access their own

## Design Decisions

### Why Denormalized?

1. **Fewer Reads**: Display plot name without fetching plot document
2. **Faster Queries**: No joins needed (Firestore has no joins)
3. **Better Offline**: Complete data in single document
4. **Lower Cost**: Firestore charges per document read

### Trade-offs

- **Update Complexity**: Must update denormalized data in multiple places
- **Data Consistency**: Risk of stale denormalized data
- **Storage Cost**: Duplicate data increases storage (usually negligible)

### Mitigation Strategies

1. Use Cloud Functions to keep denormalized data in sync
2. Store only frequently-accessed denormalized fields
3. Use batched writes to update related documents atomically
4. Implement validation in client and server code

## Usage Example

```typescript
import { createPlot, getPlot, updatePlot } from './lib/firestoreHelpers';
import { Timestamp } from 'firebase/firestore';

// Create a plot
await createPlot({
  plotCode: 'P001',
  name: 'Mae Chaem Forest Plot 1',
  location: { lat: 18.5, lng: 98.4 },
  area: 10000,
  status: 'active',
  owner: {
    uid: 'user123',
    displayName: 'John Doe',
    email: 'john@example.com'
  },
  stats: {
    totalTrees: 0,
    totalSpecies: 0,
    averageHeight: 0,
    averageDbh: 0
  },
  createdBy: 'user123'
});

// Get a plot
const plot = await getPlot('P001');

// Update plot
await updatePlot('P001', {
  name: 'Updated Plot Name'
});
```

## Migration from Supabase

Key differences from Supabase/PostgreSQL:

1. **No Foreign Keys**: Use denormalized references
2. **No Joins**: Fetch related data in multiple queries or denormalize
3. **No Transactions** (limited): Use batched writes (max 500 operations)
4. **Different Queries**: No SQL, use Firestore query API
5. **Real-time by Default**: `onSnapshot` listeners for live updates
6. **Offline Support**: Built-in with `enableIndexedDbPersistence`

## Offline Support

Firestore provides built-in offline persistence:

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { db } from './lib/firestore';

enableIndexedDbPersistence(db);
```

When offline:
- Reads return cached data
- Writes queue automatically
- Syncs when back online
- Conflicts resolved with "last write wins"

## Next Steps

1. Configure Firebase project in console
2. Add environment variables (`.env`)
3. Deploy Firestore rules and indexes
4. Migrate existing data from Supabase
5. Update React hooks to use Firestore helpers
6. Test offline functionality
