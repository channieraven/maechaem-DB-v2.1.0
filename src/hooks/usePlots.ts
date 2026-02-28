import { useEffect, useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import type { Plot } from '../lib/database.types';

interface PlotSummary extends Plot {
  tree_count: number;
  alive_count: number;
  latest_survey_date: string | null;
}

export function usePlots() {
  const db = useDatabase();
  const [plots, setPlots] = useState<PlotSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPlots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rawPlots = await db.fetchPlots();

        if (!mounted) return;

        const data = rawPlots.map(plot => ({
          ...plot,
          // Denormalized fields (maintained via Cloud Functions/triggers)
          tree_count: Number((plot as any).tree_count ?? 0),
          alive_count: Number((plot as any).alive_count ?? 0),
          latest_survey_date: (plot as any).latest_survey_date ?? null,
        } as PlotSummary));

        setPlots(data);
        setError(null);
      } catch (err: any) {
        if (!mounted) return;
        console.error('[usePlots] Error:', err);
        setError(err.message || 'ไม่สามารถโหลดข้อมูลแปลงได้');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchPlots();
    return () => { mounted = false; };
  }, [db]);

  return { plots, isLoading, error };
}
