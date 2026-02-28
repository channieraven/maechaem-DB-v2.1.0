import { useEffect, useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import type { GrowthLog, GrowthDbh, GrowthBamboo, GrowthBanana } from '../lib/database.types';
import type { TreeWithDetails } from './useTrees';

export interface GrowthLogFull extends GrowthLog {
  tree: TreeWithDetails;
  recorder: { fullname: string } | null;
  growth_dbh?: GrowthDbh | null;
  growth_bamboo?: GrowthBamboo | null;
  growth_banana?: GrowthBanana | null;
}

function toGrowthLogFull(raw: any): GrowthLogFull {
  return {
    ...raw,
    tree: {
      id: raw.tree_id ?? '',
      tree_code: raw.tree_code ?? '',
      tree_number: raw.tree_number ?? 0,
      utm_x: raw.tree_utm_x ?? null,
      utm_y: raw.tree_utm_y ?? null,
      species: {
        species_code: raw.species_code ?? '',
        name_th: raw.species_name_th ?? '',
        name_sci: raw.species_name_sci ?? '',
        plant_category: raw.plant_category ?? '',
        hex_color: raw.species_hex_color ?? '#22c55e',
      },
      plot: {
        id: raw.plot_id ?? '',
        plot_code: raw.plot_code ?? '',
        name_short: raw.plot_name_short ?? '',
        owner_name: raw.plot_owner_name ?? '',
      },
    } as TreeWithDetails,
    recorder: raw.recorder_name ? { fullname: raw.recorder_name } : null,
    growth_dbh: raw.dbh_data ?? null,
    growth_bamboo: raw.bamboo_data ?? null,
    growth_banana: raw.banana_data ?? null,
  } as GrowthLogFull;
}

export function useGrowthLogs(plotId?: string) {
  const db = useDatabase();
  const [logs, setLogs] = useState<GrowthLogFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plotId) {
      setLogs([]);
      setIsLoading(false);
      return;
    }
    let mounted = true;

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rawLogs = await db.fetchGrowthLogsByPlot(plotId);

        if (!mounted) return;

        setLogs(rawLogs.map(toGrowthLogFull));
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        console.error('[useGrowthLogs] Error:', err);
        setError(err.message || 'ไม่สามารถโหลดข้อมูลการสำรวจได้');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchLogs();
    return () => { mounted = false; };
  }, [plotId, db]);

  return { logs, isLoading, error };
}

/** Fetch all growth logs for a specific tree (for detail chart) */
export function useTreeGrowthLogs(treeId?: string) {
  const db = useDatabase();
  const [logs, setLogs] = useState<GrowthLogFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!treeId) {
      setLogs([]);
      setIsLoading(false);
      return;
    }
    let mounted = true;

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rawLogs = await db.fetchGrowthLogsByTree(treeId);

        if (!mounted) return;

        setLogs(rawLogs.map(toGrowthLogFull));
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        console.error('[useTreeGrowthLogs] Error:', err);
        setError(err.message || 'ไม่สามารถโหลดข้อมูลการสำรวจได้');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchLogs();
    return () => { mounted = false; };
  }, [treeId, db]);

  return { logs, isLoading, error };
}
