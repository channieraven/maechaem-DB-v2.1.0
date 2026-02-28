import { useCallback } from 'react';
import { useOffline } from '../contexts/OfflineContext';
import { useDatabase } from '../contexts/DatabaseContext';
import type { PlantCategory } from '../lib/database.types';

interface GrowthLogInsert {
  tree_id: string;
  survey_date: string;
  recorder_id: string | null;
  height_m: number | null;
  status: string | null;
  flowering: boolean | null;
  note: string | null;
  plantCategory: PlantCategory;
  // Denormalized tree/plot/species data (should be passed from parent component)
  tree_code?: string;
  tree_number?: number;
  plot_id?: string;
  plot_code?: string;
  plot_name_short?: string;
  species_code?: string;
  species_name_th?: string;
  species_name_sci?: string;
  plant_category?: PlantCategory;
  recorder_name?: string;
  // child data (embedded as nested objects)
  dbh_cm?: number | null;
  culm_count?: number | null;
  dbh_1_cm?: number | null;
  dbh_2_cm?: number | null;
  dbh_3_cm?: number | null;
  total_plants?: number | null;
  plants_1yr?: number | null;
  yield_bunches?: number | null;
  yield_hands?: number | null;
  price_per_hand?: number | null;
}

function buildChildData(data: GrowthLogInsert): Record<string, any> | null {
  const { plantCategory } = data;
  if (plantCategory === 'forest' || plantCategory === 'rubber' || plantCategory === 'fruit') {
    return data.dbh_cm != null ? { dbh_cm: data.dbh_cm } : null;
  }
  if (plantCategory === 'bamboo') {
    return {
      culm_count: data.culm_count ?? null,
      dbh_1_cm: data.dbh_1_cm ?? null,
      dbh_2_cm: data.dbh_2_cm ?? null,
      dbh_3_cm: data.dbh_3_cm ?? null,
    };
  }
  if (plantCategory === 'banana') {
    return {
      total_plants: data.total_plants ?? null,
      plants_1yr: data.plants_1yr ?? null,
      yield_bunches: data.yield_bunches ?? null,
      yield_hands: data.yield_hands ?? null,
      price_per_hand: data.price_per_hand ?? null,
    };
  }
  return null;
}

export function useOfflineSync() {
  const { isOnline, syncNow } = useOffline();
  const dbService = useDatabase();

  /**
   * Submit a growth log with its plant-specific child data embedded.
   * Uses Firestore's built-in offline persistence (no manual queue needed).
   */
  const submitGrowthLog = useCallback(
    async (data: GrowthLogInsert): Promise<{ success: boolean; message?: string; queued?: boolean }> => {
      try {
        // Build child measurement data based on plant category
        const dbh_data = (data.plantCategory === 'forest' || data.plantCategory === 'rubber' || data.plantCategory === 'fruit')
          ? buildChildData(data)
          : null;
        const bamboo_data = data.plantCategory === 'bamboo' ? buildChildData(data) : null;
        const banana_data = data.plantCategory === 'banana' ? buildChildData(data) : null;

        // Construct denormalized growth log document
        const logDocument = {
          tree_id: data.tree_id,
          survey_date: data.survey_date,
          recorder_id: data.recorder_id,
          height_m: data.height_m ?? null,
          status: data.status ?? 'alive',
          flowering: data.flowering ?? false,
          note: data.note ?? '',

          // Denormalized data for efficient querying
          tree_code: data.tree_code ?? '',
          tree_number: data.tree_number ?? 0,
          plot_id: data.plot_id ?? '',
          plot_code: data.plot_code ?? '',
          plot_name_short: data.plot_name_short ?? '',
          species_code: data.species_code ?? '',
          species_name_th: data.species_name_th ?? '',
          species_name_sci: data.species_name_sci ?? '',
          plant_category: data.plantCategory,
          recorder_name: data.recorder_name ?? '',

          // Embedded child measurement data
          dbh_data,
          bamboo_data,
          banana_data,
        };

        await dbService.createGrowthLog(logDocument);

        return {
          success: true,
          queued: !isOnline,
        };
      } catch (err: any) {
        console.error('[useOfflineSync] submitGrowthLog error:', err);
        return {
          success: false,
          message: err.message || 'ไม่สามารถบันทึกข้อมูลได้',
        };
      }
    },
    [isOnline, dbService],
  );

  return { submitGrowthLog, syncNow, isOnline };
}
