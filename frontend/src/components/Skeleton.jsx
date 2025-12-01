import React from 'react';

// Skeleton for card items
export const CardSkeleton = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-white/10 rounded w-full"></div>
                        <div className="h-3 bg-white/10 rounded w-5/6"></div>
                    </div>
                </div>
            ))}
        </>
    );
};

// Skeleton for table rows
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div key={colIndex} className="h-4 bg-white/10 rounded"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Skeleton for stat cards
export const StatSkeleton = ({ count = 4 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl"></div>
                    </div>
                    <div className="h-3 bg-white/10 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-white/10 rounded w-1/2"></div>
                </div>
            ))}
        </>
    );
};

// Skeleton for dashboard
export const DashboardSkeleton = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Skeleton */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 animate-pulse">
                    <div className="flex items-center gap-6">
                        <div className="w-28 h-28 bg-white/10 rounded-3xl"></div>
                        <div className="flex-1">
                            <div className="h-8 bg-white/10 rounded w-1/3 mb-3"></div>
                            <div className="h-4 bg-white/10 rounded w-1/4"></div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatSkeleton count={4} />
                </div>

                {/* Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
                            <div className="h-6 bg-white/10 rounded w-1/4 mb-6"></div>
                            <CardSkeleton count={3} />
                        </div>
                    </div>
                    <div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
                            <div className="h-6 bg-white/10 rounded w-1/3 mb-6"></div>
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-16 bg-white/10 rounded-xl"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default {
    Card: CardSkeleton,
    Table: TableSkeleton,
    Stat: StatSkeleton,
    Dashboard: DashboardSkeleton
};
