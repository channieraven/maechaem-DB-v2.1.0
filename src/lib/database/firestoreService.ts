import {
  doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc,
  collection, getDocs, limit, query, where, orderBy,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import { db as defaultDb } from '../firebase';
import type {
  Profile, Plot, Tree, Species, GrowthLog,
  UserRole,
} from '../database.types';

// ── DatabaseService Interface ───────────────────────────────────────────────

export interface DatabaseService {
  // Profiles
  fetchProfile(userId: string): Promise<Profile | null>;
  createProfile(
    userId: string,
    email: string,
    fullname: string,
    position?: string,
    organization?: string,
  ): Promise<{ profile: Profile; isFirstUser: boolean }>;
  updateProfile(
    userId: string,
    data: Partial<Pick<Profile, 'fullname' | 'position' | 'organization'>>,
  ): Promise<void>;
  deleteProfile(userId: string): Promise<void>;

  // Plots
  fetchPlots(): Promise<Plot[]>;
  fetchPlot(plotId: string): Promise<Plot | null>;
  createPlot(data: Omit<Plot, 'id' | 'created_at'>): Promise<string>;
  updatePlot(plotId: string, data: Partial<Plot>): Promise<void>;
  deletePlot(plotId: string): Promise<void>;

  // Trees
  fetchTreesByPlot(plotId: string): Promise<Tree[]>;
  fetchTreeByCode(treeCode: string): Promise<Tree | null>;
  createTree(data: Omit<Tree, 'id' | 'created_at'>): Promise<string>;
  updateTree(treeId: string, data: Partial<Tree>): Promise<void>;
  deleteTree(treeId: string): Promise<void>;

  // Growth Logs
  fetchGrowthLogsByPlot(plotId: string): Promise<GrowthLog[]>;
  fetchGrowthLogsByTree(treeId: string): Promise<GrowthLog[]>;
  createGrowthLog(data: Record<string, unknown>): Promise<string>;
  deleteGrowthLog(logId: string): Promise<void>;

  // Species
  fetchSpecies(): Promise<Species[]>;
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function createFirestoreService(db: Firestore): DatabaseService {
  return {
    // ── Profile Operations ────────────────────────────────────────────────

    async fetchProfile(userId: string): Promise<Profile | null> {
      try {
        const profileRef = doc(db, 'profiles', userId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          return profileSnap.data() as Profile;
        }
        console.warn('[Firestore] Profile not found for user:', userId);
        return null;
      } catch (error) {
        console.error('[Firestore] fetchProfile error:', error);
        return null;
      }
    },

    async createProfile(
      userId: string,
      email: string,
      fullname: string,
      position?: string,
      organization?: string,
    ): Promise<{ profile: Profile; isFirstUser: boolean }> {
      const profilesRef = collection(db, 'profiles');
      const profilesSnapshot = await getDocs(query(profilesRef, limit(1)));
      const isFirstUser = profilesSnapshot.empty;

      const role: UserRole = isFirstUser ? 'admin' : 'pending';
      const approved = isFirstUser;

      const profileData: Profile = {
        id: userId,
        email,
        fullname: fullname || '',
        position: position || null,
        organization: organization || null,
        role,
        approved,
        created_at: new Date().toISOString(),
      };

      await setDoc(doc(db, 'profiles', userId), profileData);
      return { profile: profileData, isFirstUser };
    },

    async updateProfile(
      userId: string,
      data: Partial<Pick<Profile, 'fullname' | 'position' | 'organization'>>,
    ): Promise<void> {
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, data);
    },

    async deleteProfile(userId: string): Promise<void> {
      const profileRef = doc(db, 'profiles', userId);
      await deleteDoc(profileRef);
    },

    // ── Plot Operations ───────────────────────────────────────────────────

    async fetchPlots(): Promise<Plot[]> {
      const plotsRef = collection(db, 'plots');
      const q = query(plotsRef, orderBy('plot_code'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as Plot));
    },

    async fetchPlot(plotId: string): Promise<Plot | null> {
      const plotRef = doc(db, 'plots', plotId);
      const plotSnap = await getDoc(plotRef);

      if (plotSnap.exists()) {
        return { id: plotSnap.id, ...plotSnap.data() } as Plot;
      }
      return null;
    },

    async createPlot(data: Omit<Plot, 'id' | 'created_at'>): Promise<string> {
      const plotsRef = collection(db, 'plots');
      const docRef = await addDoc(plotsRef, {
        ...data,
        created_at: new Date().toISOString(),
      });
      return docRef.id;
    },

    async updatePlot(plotId: string, data: Partial<Plot>): Promise<void> {
      const plotRef = doc(db, 'plots', plotId);
      await updateDoc(plotRef, data);
    },

    async deletePlot(plotId: string): Promise<void> {
      const plotRef = doc(db, 'plots', plotId);
      await deleteDoc(plotRef);
    },

    // ── Tree Operations ───────────────────────────────────────────────────

    async fetchTreesByPlot(plotId: string): Promise<Tree[]> {
      const treesRef = collection(db, 'trees');
      const q = query(treesRef, where('plot_id', '==', plotId), orderBy('tree_number'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as Tree));
    },

    async fetchTreeByCode(treeCode: string): Promise<Tree | null> {
      const treesRef = collection(db, 'trees');
      const q = query(treesRef, where('tree_code', '==', treeCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const d = snapshot.docs[0];
      return { id: d.id, ...d.data() } as Tree;
    },

    async createTree(data: Omit<Tree, 'id' | 'created_at'>): Promise<string> {
      const treesRef = collection(db, 'trees');
      const docRef = await addDoc(treesRef, {
        ...data,
        created_at: new Date().toISOString(),
      });
      return docRef.id;
    },

    async updateTree(treeId: string, data: Partial<Tree>): Promise<void> {
      const treeRef = doc(db, 'trees', treeId);
      await updateDoc(treeRef, data);
    },

    async deleteTree(treeId: string): Promise<void> {
      const treeRef = doc(db, 'trees', treeId);
      await deleteDoc(treeRef);
    },

    // ── Growth Log Operations ─────────────────────────────────────────────

    async fetchGrowthLogsByPlot(plotId: string): Promise<GrowthLog[]> {
      const logsRef = collection(db, 'growth_logs');
      const q = query(logsRef, where('plot_id', '==', plotId), orderBy('survey_date', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as GrowthLog));
    },

    async fetchGrowthLogsByTree(treeId: string): Promise<GrowthLog[]> {
      const logsRef = collection(db, 'growth_logs');
      const q = query(logsRef, where('tree_id', '==', treeId), orderBy('survey_date', 'asc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as GrowthLog));
    },

    async createGrowthLog(data: Record<string, unknown>): Promise<string> {
      const logsRef = collection(db, 'growth_logs');
      const docRef = await addDoc(logsRef, {
        ...data,
        created_at: Timestamp.now(),
      });
      return docRef.id;
    },

    async deleteGrowthLog(logId: string): Promise<void> {
      const logRef = doc(db, 'growth_logs', logId);
      await deleteDoc(logRef);
    },

    // ── Species Operations ────────────────────────────────────────────────

    async fetchSpecies(): Promise<Species[]> {
      const speciesRef = collection(db, 'species');
      const q = query(speciesRef, orderBy('species_code'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      } as Species));
    },
  };
}

// ── Default instance (uses the app's Firestore) ─────────────────────────────

export const firestoreService = createFirestoreService(defaultDb);

export type { Profile, Plot, Tree, Species, GrowthLog } from '../database.types';
