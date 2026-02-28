/**
 * Cloud Functions for Mae Chaem Tree Database
 *
 * This file contains Firebase Cloud Functions that handle backend logic:
 * - User profile creation and management
 * - Data aggregation and computed fields
 * - Background tasks and triggers
 */

import * as admin from "firebase-admin";
import {setGlobalOptions} from "firebase-functions/v2";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  region: "asia-southeast1", // Bangkok region for lower latency in Thailand
  memory: "256MiB",
  timeoutSeconds: 60,
});

// ─────────────────────────────────────────────────────────────────────────────
// User Management Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * createUserProfile - HTTP Callable function to create profile
 *
 * Called by client after Firebase Auth registration completes.
 * Creates profile document with appropriate role and approval status.
 *
 * Behavior:
 * - First user: role="admin", approved=true (bootstrap admin)
 * - Subsequent: role="pending", approved=false (needs approval)
 *
 * Usage from client:
 * const result = await httpsCallable(functions, 'createUserProfile')();
 */
export const createUserProfile = onCall(async (request) => {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const db = admin.firestore();

  try {
    logger.info(`[createUserProfile] Processing user: ${uid}`);

    // Check if profile already exists
    const existingProfile = await db.collection("profiles").doc(uid).get();
    if (existingProfile.exists) {
      logger.info(`[createUserProfile] Profile exists for ${uid}`);
      return {success: true, message: "Profile already exists"};
    }

    // Check if this is the first user (bootstrap admin)
    const profilesSnapshot = await db.collection("profiles")
      .limit(1)
      .get();
    const isFirstUser = profilesSnapshot.empty;

    // Get user info from Firebase Auth
    const userRecord = await admin.auth().getUser(uid);
    const email = userRecord.email || "";
    const displayName = userRecord.displayName ||
      email.split("@")[0] || "User";

    // Create profile document
    const profileData = {
      email: email,
      fullname: displayName,
      role: isFirstUser ? "admin" : "pending",
      approved: isFirstUser,
      position: null,
      organization: null,
      phone: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("profiles").doc(uid).set(profileData);

    logger.info(
      `[createUserProfile] Profile created for ${uid}`,
      {
        role: profileData.role,
        approved: profileData.approved,
        isFirstUser,
      }
    );

    // Set custom claims for RBAC
    await admin.auth().setCustomUserClaims(uid, {
      role: profileData.role,
      approved: profileData.approved,
    });

    logger.info(`[createUserProfile] Custom claims set for ${uid}`);

    return {
      success: true,
      message: "Profile created successfully",
      role: profileData.role,
      approved: profileData.approved,
    };
  } catch (error) {
    logger.error(
      `[createUserProfile] Error for ${uid}:`,
      error
    );
    throw new HttpsError(
      "internal",
      "Failed to create profile"
    );
  }
});

/**
 * onProfileUpdate - Sync role changes to Auth custom claims
 *
 * When admin updates user role or approval status in Firestore,
 * automatically update the user's custom claims for RBAC.
 *
 * COMMENTED OUT: Firestore trigger has region detection issues.
 * Workaround: Admin can manually refresh user tokens, or use
 * createUserProfile to reset claims.
 */
// export const onProfileUpdate = onDocumentWritten(
//   "profiles/{userId}",
//   async (event) => {
//     const userId = event.params.userId;
//     const afterData = event.data?.after.data();
//     const beforeData = event.data?.before.data();

//     // Skip if document was deleted
//     if (!afterData) {
//       logger.info(`[onProfileUpdate] Profile deleted: ${userId}`);
//       return;
//     }

//     // Skip if role/approved unchanged
//     if (beforeData &&
//         afterData.role === beforeData.role &&
//         afterData.approved === beforeData.approved) {
//       return;
//     }

//     try {
//       const role = afterData.role || "pending";
//       const approved = afterData.approved === true;

//       logger.info(
//         `[onProfileUpdate] Updating claims for ${userId}`,
//         {role, approved}
//       );

//       await admin.auth().setCustomUserClaims(userId, {
//         role,
//         approved,
//       });

//       logger.info(`[onProfileUpdate] Claims updated for ${userId}`);
//     } catch (error) {
//       logger.error(
//         `[onProfileUpdate] Error for ${userId}:`,
//         error
//       );
//     }
//   }
// );

// ─────────────────────────────────────────────────────────────────────────────
// Data Aggregation Functions (Optional - for performance optimization)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * updatePlotTreeCount - Maintain denormalized tree_count
 *
 * When tree created/deleted, update parent plot's tree_count.
 * Avoids expensive counting queries on every plot list view.
 *
 * Note: For Phase 1, client-side counting is acceptable.
 * Deploy this only if plot list performance becomes an issue.
 */
// export const updatePlotTreeCount = onDocumentWritten(
//   "trees/{treeId}",
//   async (event) => {
//     const treeData = event.data?.after.data();
//     const plotId = treeData?.plot_id;
//
//     if (!plotId) return;
//
//     const db = admin.firestore();
//     const treesSnapshot = await db
//       .collection("trees")
//       .where("plot_id", "==", plotId)
//       .count()
//       .get();
//
//     await db.collection("plots").doc(plotId).update({
//       tree_count: treesSnapshot.data().count,
//       updated_at: admin.firestore.FieldValue.serverTimestamp(),
//     });
//   }
// );

/**
 * updatePlotAliveCount - Maintain denormalized alive_count field in plots
 *
 * When a growth_log is created with status="alive" or "dead", update the
 * parent plot's alive_count by analyzing the latest status of each tree.
 *
 * Note: This is complex and may cause race conditions. For Phase 1,
 * recommend computing alive_count client-side or via scheduled function.
 */
// export const updatePlotAliveCount = onDocumentCreated(
//   "growth_logs/{logId}",
//   async (event) => {
//     // Implementation omitted for Phase 1
//     // Requires complex logic to determine "latest" status per tree
//   }
// );

