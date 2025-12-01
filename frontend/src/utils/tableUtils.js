// Search utility function
export const searchItems = (items, searchTerm, searchFields) => {
    if (!searchTerm || searchTerm.trim() === '') return items;

    const term = searchTerm.toLowerCase().trim();

    return items.filter(item => {
        return searchFields.some(field => {
            const value = getNestedValue(item, field);
            return value && value.toString().toLowerCase().includes(term);
        });
    });
};

// Get nested object value by path (e.g., 'user.name')
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Sort utility function
export const sortItems = (items, sortBy, sortOrder = 'asc') => {
    if (!sortBy) return items;

    return [...items].sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);

        // Handle null/undefined
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Handle dates
        if (aValue instanceof Date && bValue instanceof Date) {
            return sortOrder === 'asc'
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime();
        }

        // Handle numbers
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle strings
        const aStr = aValue.toString().toLowerCase();
        const bStr = bValue.toString().toLowerCase();

        if (sortOrder === 'asc') {
            return aStr.localeCompare(bStr);
        } else {
            return bStr.localeCompare(aStr);
        }
    });
};

// Pagination utility function
export const paginateItems = (items, page = 1, itemsPerPage = 10) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
        items: items.slice(startIndex, endIndex),
        totalPages: Math.ceil(items.length / itemsPerPage),
        currentPage: page,
        totalItems: items.length,
        itemsPerPage,
        hasNextPage: endIndex < items.length,
        hasPrevPage: page > 1
    };
};

// CSV export utility function
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    // Determine columns
    const headers = columns || Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map(row =>
            headers.map(header => {
                const value = getNestedValue(row, header);
                // Escape commas and quotes
                if (value == null) return '';
                const str = value.toString();
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

// Combined utility hook for search, sort, and pagination
export const useTableData = (initialData, config = {}) => {
    const {
        searchFields = [],
        defaultSortBy = null,
        defaultSortOrder = 'asc',
        itemsPerPage = 10
    } = config;

    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortBy, setSortBy] = React.useState(defaultSortBy);
    const [sortOrder, setSortOrder] = React.useState(defaultSortOrder);
    const [currentPage, setCurrentPage] = React.useState(1);

    // Process data
    let processedData = initialData;

    // Apply search
    if (searchTerm && searchFields.length > 0) {
        processedData = searchItems(processedData, searchTerm, searchFields);
    }

    // Apply sort
    if (sortBy) {
        processedData = sortItems(processedData, sortBy, sortOrder);
    }

    // Apply pagination
    const paginatedData = paginateItems(processedData, currentPage, itemsPerPage);

    // Toggle sort
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1); // Reset to first page
    };

    return {
        // Data
        data: paginatedData.items,
        totalItems: paginatedData.totalItems,

        // Pagination
        currentPage: paginatedData.currentPage,
        totalPages: paginatedData.totalPages,
        hasNextPage: paginatedData.hasNextPage,
        hasPrevPage: paginatedData.hasPrevPage,
        setCurrentPage,

        // Search
        searchTerm,
        setSearchTerm,

        // Sort
        sortBy,
        sortOrder,
        handleSort,

        // Export
        exportToCSV: () => exportToCSV(processedData, 'export.csv')
    };
};

export default {
    searchItems,
    sortItems,
    paginateItems,
    exportToCSV,
    useTableData
};
