import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import type { TreeWithDetails } from '../../hooks/useTrees';
import { useAuth } from '../../hooks/useAuth';

interface TreeTableProps {
  trees: TreeWithDetails[];
  isLoading?: boolean;
}

const TreeTable: React.FC<TreeTableProps> = ({ trees, isLoading = false }) => {
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');

  const speciesOptions = Array.from(new Set(trees.map((t) => t.species.species_code))).sort();

  const filtered = trees.filter((t) => {
    const matchSearch =
      !search ||
      t.tree_code.toLowerCase().includes(search.toLowerCase()) ||
      t.species.name_th.includes(search) ||
      (t.tag_label ?? '').includes(search);
    const matchSpecies = !speciesFilter || t.species.species_code === speciesFilter;
    return matchSearch && matchSpecies;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาต้นไม้..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
          />
        </div>
        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600"
        >
          <option value="">ทุกชนิด</option>
          {speciesOptions.map((code) => {
            const sp = trees.find((t) => t.species.species_code === code)?.species;
            return (
              <option key={code} value={code}>
                {code} — {sp?.name_th}
              </option>
            );
          })}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/60 text-[10px] uppercase text-gray-400 font-bold border-b border-gray-100">
            <tr>
              {['รหัสต้นไม้', 'ชนิดพันธุ์', 'แถว', 'สถานะ', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                  {isLoading ? 'กำลังโหลด...' : 'ไม่พบข้อมูล'}
                </td>
              </tr>
            ) : (
              filtered.map((tree) => (
                <tr
                  key={tree.id}
                  onClick={() => navigate(`/trees/${tree.tree_code}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: `#${tree.species.hex_color}` }}
                      />
                      {tree.tree_code}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-gray-900">{tree.species.name_th}</span>
                      {tree.species.name_sci && (
                        <span className="text-gray-400 text-xs ml-1 italic">{tree.species.name_sci}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {tree.row_main}{tree.row_sub ? `-${tree.row_sub}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    {/* Latest status shown from growth logs - placeholder */}
                    <span className="text-gray-400 text-xs">—</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canWrite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trees/${tree.tree_code}/add-log`);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-[#2d5a27] font-medium hover:underline"
                      >
                        <Plus size={12} />
                        บันทึก
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-400 text-right">แสดง {filtered.length} / {trees.length} ต้น</p>
    </div>
  );
};

export default TreeTable;
