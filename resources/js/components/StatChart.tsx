import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ReactNode;
    trend?: number;
    trendLabel?: string;
    colorClass: string;
    color?: string;
    trendType?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendLabel, colorClass }) => {
    return (
        <div className={`rounded-lg p-6 shadow-md ${colorClass}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <h3 className="mt-1 text-3xl font-bold">{value}</h3>
                    {trend !== undefined && (
                        <div className="mt-2 flex items-center">
                            {trend > 0 ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-1 h-4 w-4 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            ) : trend < 0 ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-1 h-4 w-4 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-1 h-4 w-4 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                </svg>
                            )}
                            <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {Math.abs(trend)}% {trendLabel}
                            </span>
                        </div>
                    )}
                </div>
                <div className="bg-opacity-30 flex h-12 w-12 items-center justify-center rounded-full bg-white">{icon}</div>
            </div>
        </div>
    );
};

interface BarChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
    }[];
}

interface PieChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
    }[];
}

interface BarChartProps {
    title: string;
    description: string;
    data: BarChartData;
}

export const BarChart: React.FC<BarChartProps> = ({ title, description, data }) => {
    // In a real implementation, you would use a charting library like Chart.js
    // This is a visual placeholder to demonstrate the UI
    const maxValue = Math.max(...data.datasets[0].data);

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="mt-6 space-y-4">
                {data.labels.map((label, index) => (
                    <div key={index}>
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            <span className="text-sm font-medium text-gray-900">{data.datasets[0].data[index]}</span>
                        </div>
                        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-4 rounded-full"
                                style={{
                                    width: `${(data.datasets[0].data[index] / maxValue) * 100}%`,
                                    backgroundColor: data.datasets[0].backgroundColor,
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface PieChartProps {
    title: string;
    description: string;
    data: PieChartData;
}

export const PieChart: React.FC<PieChartProps> = ({ title, description, data }) => {
    // In a real implementation, you would use a charting library like Chart.js
    // This is a visual placeholder to demonstrate the UI
    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="mt-6">
                <div className="flex justify-center">
                    <div className="relative h-48 w-48">
                        <div className="h-48 w-48 rounded-full bg-gray-100"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-700">{total}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                    {data.labels.map((label, index) => (
                        <div key={index} className="flex items-center">
                            <div className="mr-2 h-4 w-4 rounded-full" style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}></div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">{label}</p>
                                <p className="text-xs text-gray-500">
                                    {data.datasets[0].data[index]} ({((data.datasets[0].data[index] / total) * 100).toFixed(1)}%)
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface LineChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
    }[];
}

interface LineChartProps {
    title: string;
    description: string;
    data: LineChartData;
}

export const LineChart: React.FC<LineChartProps> = ({ title, description, data }) => {
    // In a real implementation, you would use a charting library like Chart.js
    // This is a visual placeholder to demonstrate the UI
    const maxValue = Math.max(...data.datasets[0].data);
    const minValue = Math.min(...data.datasets[0].data);
    const range = maxValue - minValue;

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="mt-6 h-64 w-full">
                <div className="flex h-full w-full items-end justify-between">
                    {data.labels.map((label, index) => (
                        <div key={index} className="flex h-full flex-col items-center justify-end">
                            <div
                                className="w-8 rounded-t"
                                style={{
                                    height: `${((data.datasets[0].data[index] - minValue) / (range || 1)) * 80}%`,
                                    backgroundColor: data.datasets[0].borderColor,
                                }}
                            ></div>
                            <span className="mt-2 text-xs text-gray-500">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
