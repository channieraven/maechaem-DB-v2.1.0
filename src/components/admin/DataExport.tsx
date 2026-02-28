import React, { useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Download, Loader2 } from 'lucide-react';

const DataExport: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Fetch all growth logs with denormalized data
      const logsRef = collection(db, 'growth_logs');
      const q = query(logsRef, orderBy('survey_date', 'desc'));
      const snapshot = await getDocs(q);

      const rows = snapshot.docs.map((docSnap) => {
        const row = docSnap.data();
        return {
          plot_code: row.plot_code ?? '',
          tree_code: row.tree_code ?? '',
          survey_date: row.survey_date ?? '',
          height_m: row.height_m ?? '',
          dbh_cm: row.dbh_data?.dbh_cm ?? '',
          status: row.status ?? '',
          flowering: row.flowering ? 'yes' : 'no',
          note: row.note ?? '',
        };
      });

      if (rows.length === 0) {
        alert('ไม่มีข้อมูลที่จะส่งออก');
        return;
      }

      const headers = Object.keys(rows[0] ?? {});
      const csv = [
        headers.join(','),
        ...rows.map((r) => headers.map((h) => JSON.stringify((r as any)[h] ?? '')).join(',')),
      ].join('\n');

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `growth_logs_${new Date().toLocaleDateString('sv')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[DataExport] Error:', err);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">ส่งออกข้อมูล</h3>
      <p className="text-sm text-gray-500 mb-4">ดาวน์โหลดข้อมูลการเจริญเติบโตทั้งหมดเป็นไฟล์ CSV</p>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        {isExporting ? 'กำลังส่งออก...' : 'ดาวน์โหลด CSV'}
      </button>
    </div>
  );
};

export default DataExport;
