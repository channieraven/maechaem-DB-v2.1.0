import { useEffect, useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import type { Species } from '../lib/database.types';

export function useSpecies() {
  const db = useDatabase();
  const [species, setSpecies] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchSpecies = async () => {
      setIsLoading(true);
      try {
        const data = await db.fetchSpecies();

        if (!mounted) return;

        setSpecies(data);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        console.error('[useSpecies] Error:', err);
        setError(err.message || 'ไม่สามารถโหลดข้อมูลชนิดพันธุ์ได้');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchSpecies();
    return () => { mounted = false; };
  }, [db]);

  return { species, isLoading, error };
}
