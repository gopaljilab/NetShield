import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Columns,
  CheckSquare,
  Square,
  MinusSquare,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => number | string;
  searchable?: boolean;
  searchValue?: (item: T) => string;
  className?: string;
  defaultVisible?: boolean;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'danger' | 'secondary';
  onClick: (selectedItems: T[]) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  bulkActions?: BulkAction<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  initialPageSize?: number;
  selectable?: boolean;
  filterSlot?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Search records...',
  bulkActions = [],
  onRowClick,
  emptyMessage = 'No matching telemetry records found.',
  initialPageSize = 10,
  selectable = true,
  filterSlot,
}: DataTableProps<T>) {
  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    columns.forEach((col) => {
      init[col.key] = col.defaultVisible ?? true;
    });
    return init;
  });
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  // Search & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter across searchable columns
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return columns.some((col) => {
          if (col.searchable === false) return false;
          if (col.searchValue) {
            return col.searchValue(item).toLowerCase().includes(term);
          }
          const val = (item as Record<string, unknown>)[col.key];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      });
    }

    // Sorting
    if (sortConfig) {
      const col = columns.find((c) => c.key === sortConfig.key);
      if (col) {
        result.sort((a, b) => {
          let aVal: string | number;
          let bVal: string | number;

          if (col.sortValue) {
            aVal = col.sortValue(a);
            bVal = col.sortValue(b);
          } else {
            aVal = ((a as Record<string, unknown>)[col.key] as string | number) ?? '';
            bVal = ((b as Record<string, unknown>)[col.key] as string | number) ?? '';
          }

          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, columns, searchTerm, sortConfig]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      paginatedData.forEach((item) => next.add(keyExtractor(item)));
      setSelectedIds(next);
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const selectedItems = useMemo(() => {
    return data.filter((item) => selectedIds.has(keyExtractor(item)));
  }, [data, selectedIds, keyExtractor]);

  const activeColumns = columns.filter((col) => visibleColumns[col.key] !== false);

  const allSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(keyExtractor(item)));
  const someSelected =
    paginatedData.some((item) => selectedIds.has(keyExtractor(item))) && !allSelected;

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search, Filters, Column Visibility */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-navy-950 border border-navy-750 rounded-lg pl-9 pr-8 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterSlot}

          {/* Column Toggle Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
              className="px-3 py-2 bg-navy-900 hover:bg-navy-850 text-slate-300 border border-navy-750 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Columns className="w-3.5 h-3.5 text-cyan-400" />
              <span>Columns</span>
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-navy-900 border border-navy-750 rounded-xl p-2.5 shadow-2xl z-30 space-y-1 text-xs">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 border-b border-navy-800">
                  Visible Columns
                </div>
                {columns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-navy-800/80 cursor-pointer text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key] !== false}
                      onChange={(e) => {
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [col.key]: e.target.checked,
                        }));
                      }}
                      className="rounded border-navy-700 bg-navy-950 text-cyan-500 focus:ring-0"
                    />
                    <span className="truncate">{col.header}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar if items selected */}
      {selectable && selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-cyan-950/80 border border-cyan-500/40 p-2.5 px-4 rounded-xl text-xs shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-cyan-200 font-mono">
            <CheckSquare className="w-4 h-4 text-cyan-400" />
            <span>
              <strong>{selectedIds.size}</strong> record{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions.map((action, i) => (
              <button
                key={i}
                type="button"
                onClick={() => action.onClick(selectedItems)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  action.variant === 'danger'
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    : action.variant === 'secondary'
                    ? 'bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40'
                }`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                {selectable && (
                  <th className="p-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-cyan-400 transition-colors"
                      title={allSelected ? 'Deselect all' : 'Select page'}
                    >
                      {allSelected ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : someSelected ? (
                        <MinusSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                {activeColumns.map((col) => {
                  const isSorted = sortConfig?.key === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={`p-3.5 font-semibold select-none ${
                        col.sortable !== false ? 'cursor-pointer hover:text-slate-200' : ''
                      } ${col.className || ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.header}</span>
                        {col.sortable !== false && (
                          <span className="text-slate-500">
                            {isSorted ? (
                              sortConfig.direction === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                              )
                            ) : (
                              <ChevronsUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono text-slate-300">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeColumns.length + (selectable ? 1 : 0)}
                    className="p-8 text-center text-slate-500 font-sans text-xs"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const id = keyExtractor(item);
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr
                      key={id}
                      onClick={() => onRowClick?.(item)}
                      className={`hover:bg-navy-800/50 transition-colors ${
                        isSelected ? 'bg-cyan-500/5' : ''
                      } ${onRowClick ? 'cursor-pointer' : ''}`}
                    >
                      {selectable && (
                        <td className="p-3.5 text-center" onClick={(e) => handleToggleRow(id, e)}>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-cyan-400 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {activeColumns.map((col) => (
                        <td key={col.key} className={`p-3.5 ${col.className || ''}`}>
                          {col.accessor
                            ? col.accessor(item)
                            : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 px-4 bg-navy-950/60 border-t border-navy-800 text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <strong className="text-slate-200">
                {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-200">
                {Math.min(currentPage * pageSize, filteredData.length)}
              </strong>{' '}
              of <strong className="text-slate-200">{filteredData.length}</strong> records
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Page size select */}
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-navy-900 border border-navy-750 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-navy-850 hover:bg-navy-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-navy-850 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-navy-850 hover:bg-navy-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-navy-850 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
