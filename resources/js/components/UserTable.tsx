import React, { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'relawan' | 'masyarakat';
    status: 'active' | 'inactive';
    created_at: string;
}

interface UserTableProps {
    users: User[];
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onStatusChange?: (id: number, status: 'active' | 'inactive') => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete, onStatusChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'name' | 'email' | 'role' | 'status' | 'created_at'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const itemsPerPage = 10;

    // Search filter
    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Sort
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortField === 'created_at') {
            return sortDirection === 'asc'
                ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    const currentUsers = sortedUsers.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

    const handleSort = (field: 'name' | 'email' | 'role' | 'status' | 'created_at') => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (field !== sortField) return null;
        return sortDirection === 'asc' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">Admin</span>;
            case 'relawan':
                return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Relawan</span>;
            case 'masyarakat':
                return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Masyarakat</span>;
            default:
                return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">{role}</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        return status === 'active' ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Aktif</span>
        ) : (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">Nonaktif</span>
        );
    };

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-4">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Daftar Pengguna</h2>
                    <div className="w-full md:w-64">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari pengguna..."
                                className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                    onClick={() => handleSort('name')}
                                >
                                    <span className="cursor-pointer">Nama {getSortIcon('name')}</span>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                    onClick={() => handleSort('email')}
                                >
                                    <span className="cursor-pointer">Email {getSortIcon('email')}</span>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                    onClick={() => handleSort('role')}
                                >
                                    <span className="cursor-pointer">Role {getSortIcon('role')}</span>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                    onClick={() => handleSort('status')}
                                >
                                    <span className="cursor-pointer">Status {getSortIcon('status')}</span>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                    onClick={() => handleSort('created_at')}
                                >
                                    <span className="cursor-pointer">Tanggal Dibuat {getSortIcon('created_at')}</span>
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        onStatusChange && onStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')
                                                    }
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                >
                                                    {user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                                </button>
                                                <button
                                                    onClick={() => onEdit && onEdit(user.id)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDelete && onDelete(user.id)}
                                                    className="text-xs text-red-600 hover:text-red-800"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                        {searchTerm ? 'Tidak ada pengguna yang ditemukan.' : 'Tidak ada pengguna yang tersedia.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Menampilkan {firstIndex + 1}-{Math.min(lastIndex, sortedUsers.length)} dari {sortedUsers.length} pengguna
                        </div>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`rounded-md px-3 py-1 text-sm ${
                                    currentPage === 1 ? 'cursor-not-allowed text-gray-400' : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                                }`}
                            >
                                Sebelumnya
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`rounded-md px-3 py-1 text-sm ${
                                        currentPage === page ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`rounded-md px-3 py-1 text-sm ${
                                    currentPage === totalPages
                                        ? 'cursor-not-allowed text-gray-400'
                                        : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                                }`}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserTable;
