import React from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
    data,
    columns,
    searchable = true,
    sortable = true,
    exportable = true,
    onExport,
    onSort,
    sortBy,
    sortOrder,
    searchTerm,
    onSearchChange,
    // Pagination
    currentPage,
    totalPages,
    onPageChange,
    totalItems
}) => {
    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Search */}
                {searchable && (
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                        />
                    </div>
                )}

                {/* Export Button */}
                {exportable && onExport && (
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-xl text-green-300 font-medium transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="px-6 py-4 text-left text-sm font-semibold text-gray-300"
                                    >
                                        {sortable && column.sortable !== false ? (
                                            <button
                                                onClick={() => onSort(column.key)}
                                                className="flex items-center gap-2 hover:text-white transition-colors"
                                            >
                                                {column.label}
                                                {sortBy === column.key ? (
                                                    sortOrder === 'asc' ? (
                                                        <ArrowUp className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowDown className="h-4 w-4" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown className="h-4 w-4 opacity-40" />
                                                )}
                                            </button>
                                        ) : (
                                            column.label
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {data.length > 0 ? (
                                data.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                                        {columns.map((column) => (
                                            <td key={column.key} className="px-6 py-4 text-sm text-gray-300">
                                                {column.render
                                                    ? column.render(row[column.key], row, rowIndex)
                                                    : row[column.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        Showing {data.length} of {totalItems} results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-lg text-white transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // Show first, last, current, and adjacent pages
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => onPageChange(page)}
                                            className={`px-3 py-1 rounded-lg font-medium transition-colors ${page === currentPage
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="text-gray-500">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-lg text-white transition-colors"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
