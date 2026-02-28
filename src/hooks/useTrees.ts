import { useEffect, useState } from 'react';
import proj4 from 'proj4';
import { useDatabase } from '../contexts/DatabaseContext';
import type { Tree, Species, Plot } from '../lib/database.types';

// Define UTM Zone 47N (EPSG:32647) and WGS84 (EPSG:4326)
proj4.defs('EPSG:32647', '+proj=utm +zone=47 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

export interface TreeWithDetails extends Tree {
  species: Pick<Species, 'species_code' | 'name_th' | 'name_sci' | 'plant_category' | 'hex_color'>;
  plot: Pick<Plot, 'id' | 'plot_code' | 'name_short' | 'owner_name'>;
  lat?: number | null;
  lng?: number | null;
}

function convertUtmToLatLng(utmX: number | null, utmY: number | null, docId: string) {
  if (utmX == null || utmY == null) return { lat: null, lng: null };
  try {
    const [longitude, latitude] = proj4('EPSG:32647', 'EPSG:4326', [Number(utmX), Number(utmY)]);
    return { lat: latitude, lng: longitude };
  } catch (err) {
    console.warn(`Failed to convert coordinates for tree ${docId}:`, err);
    return { lat: null, lng: null };
  }
}

function toTreeWithDetails(raw: any): TreeWithDetails {
  const { lat, lng } = convertUtmToLatLng(raw.utm_x, raw.utm_y, raw.id);
  return {
    ...raw,
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
    lat,
    lng,
  } as TreeWithDetails;
}

export function useTrees(plotId?: string) {
  const db = useDatabase();
  const [trees, setTrees] = useState<TreeWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plotId) {
      setTrees([]);
      setIsLoading(false);
      return;
    }
    let mounted = true;

    const fetchTrees = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rawTrees = await db.fetchTreesByPlot(plotId);

        if (!mounted) return;

        setTrees(rawTrees.map(toTreeWithDetails));
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        console.error('[useTrees] Error:', err);
        setError(err.message || 'ไม่สามารถโหลดข้อมูลต้นไม้ได้');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchTrees();
    return () => { mounted = false; };
  }, [plotId, db]);

  return { trees, isLoading, error };
}

/** Fetch a single tree by tree_code */
export function useTree(treeCode?: string) {
  const db = useDatabase();
  const [tree, setTree] = useState<TreeWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!treeCode) {
      setTree(null);
      setIsLoading(false);
      return;
    }
    let mounted = true;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const raw = await db.fetchTreeByCode(treeCode);

        if (!mounted) return;

        if (!raw) {
          setError('ไม่พบต้นไม้');
          setTree(null);
          setIsLoading(false);
          return;
        }

        setTree(toTreeWithDetails(raw));
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        console.error('[useTree] Error:', err);
        setError(err.message || 'ไม่สามารถโหลดข้อมูลต้นไม้ได้');
        setTree(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetch();
    return () => { mounted = false; };
  }, [treeCode, db]);

  return { tree, isLoading, error };
}
