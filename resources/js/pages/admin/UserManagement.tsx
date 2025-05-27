import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { PencilIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../hooks/useToast';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manajemen Pengguna',
        href: '/admin/users',
    },
];

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        role: string;
        status: boolean;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'masyarakat',
        status: true,
    });

    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        try {
            // Menggunakan endpoint yang sudah terdaftar di web.php
            const response = await axios.get('/admin/users/data');

            // Pastikan kita mendapatkan array dari response
            if (response.data && response.data.data) {
                setUsers(response.data.data);
            } else {
                // Jika format tidak sesuai, set array kosong
                setUsers([]);
                console.error('Format response tidak sesuai:', response.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data pengguna',
                variant: 'destructive',
            });
            // Set array kosong jika terjadi error
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [toast]); // Add toast as a dependency

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === 'status') {
            setFormData((prev) => ({ ...prev, [name]: value === 'active' }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'masyarakat',
            status: true,
        });
        setSelectedUser(null);
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post('/admin/users', formData);
            toast({
                title: 'Berhasil',
                description: 'Pengguna berhasil ditambahkan',
            });
            setIsAddDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: unknown) {
            console.error('Failed to add user:', error);

            // Show validation errors if available
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors as Record<string, string[]>).flat();
                toast({
                    title: 'Error Validasi',
                    description: validationErrors.join(', '),
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Gagal menambahkan pengguna',
                    variant: 'destructive',
                });
            }
        }
    };

    const prepareEditUser = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't fill password for edit
            password_confirmation: '', // Also set empty password confirmation
            role: user.role,
            status: user.status,
        });
        setIsEditDialogOpen(true);
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser || !selectedUser.id) {
            toast({
                title: 'Error',
                description: 'User ID tidak ditemukan',
                variant: 'destructive',
            });
            return;
        }

        const updateData = { ...formData } as Partial<typeof formData>;

        // Don't send empty password
        if (!updateData.password) {
            delete updateData.password;
            delete updateData.password_confirmation;
        } else {
            // If password is provided, we need password_confirmation as well
            updateData.password_confirmation = formData.password_confirmation;
        }

        try {
            // Using the correct Laravel resource route format with ID
            console.log('Selected User Object:', selectedUser);
            const userId = selectedUser.id;

            // Create the URL explicitly to avoid any issues
            const updateUrl = `/admin/users/${userId}`;
            console.log('Updating user with ID:', userId, 'URL:', updateUrl);

            // Use PATCH method which is also supported by Laravel resource controller
            // Add the _method parameter to ensure Laravel understands this is an update
            const requestData = {
                ...updateData,
                _method: 'PATCH', // Laravel form method spoofing
            };

            await axios.post(updateUrl, requestData);
            toast({
                title: 'Berhasil',
                description: 'Pengguna berhasil diperbarui',
            });
            setIsEditDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: unknown) {
            console.error('Failed to update user:', error);

            // Show validation errors if available
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors as Record<string, string[]>).flat();
                toast({
                    title: 'Error Validasi',
                    description: validationErrors.join(', '),
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Gagal memperbarui pengguna',
                    variant: 'destructive',
                });
            }
        }
    };

    const prepareDeleteUser = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            // Log the user being deleted
            console.log('Deleting user with ID:', selectedUser.id);

            // Use method spoofing for DELETE, similar to how we fixed the update
            const deleteUrl = `/admin/users/${selectedUser.id}`;
            await axios.post(deleteUrl, {
                _method: 'DELETE', // Laravel form method spoofing
            });

            toast({
                title: 'Berhasil',
                description: 'Pengguna berhasil dihapus',
            });
            setIsDeleteDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast({
                title: 'Error',
                description: 'Gagal menghapus pengguna',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Manajemen Pengguna</CardTitle>
                            <CardDescription>Kelola data pengguna aplikasi</CardDescription>
                        </div>

                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlusIcon className="mr-2 h-4 w-4" />
                                    Tambah Pengguna
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                                    <DialogDescription>Isi formulir berikut untuk menambahkan pengguna baru</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddUser}>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nama</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Masukkan nama pengguna"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Masukkan email pengguna"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Masukkan password"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                value={formData.password_confirmation}
                                                onChange={handleInputChange}
                                                placeholder="Masukkan konfirmasi password"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                                                <SelectTrigger id="role">
                                                    <SelectValue placeholder="Pilih role pengguna" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="relawan">Relawan</SelectItem>
                                                    <SelectItem value="masyarakat">Masyarakat</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={formData.status ? 'active' : 'inactive'}
                                                onValueChange={(value) => handleSelectChange('status', value)}
                                            >
                                                <SelectTrigger id="status">
                                                    <SelectValue placeholder="Pilih status pengguna" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Aktif</SelectItem>
                                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button type="submit">Simpan</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="mb-4 h-8 rounded bg-gray-200"></div>
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-12 rounded bg-gray-200"></div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                                                    Tidak ada data pengguna
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs ${
                                                                user.role === 'admin'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : user.role === 'relawan'
                                                                      ? 'bg-green-100 text-green-800'
                                                                      : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {user.role}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs ${
                                                                user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}
                                                        >
                                                            {user.status ? 'Aktif' : 'Tidak Aktif'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Button variant="outline" size="sm" onClick={() => prepareEditUser(user)}>
                                                                <PencilIcon className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                            <Button variant="destructive" size="sm" onClick={() => prepareDeleteUser(user)}>
                                                                <Trash2Icon className="h-4 w-4" />
                                                                <span className="sr-only">Delete</span>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Edit User Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Pengguna</DialogTitle>
                            <DialogDescription>Edit informasi pengguna</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditUser}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nama</Label>
                                    <Input
                                        id="edit-name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan nama pengguna"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan email pengguna"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-password">Password (kosongkan jika tidak ingin mengubah)</Label>
                                    <Input
                                        id="edit-password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan password baru"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-password-confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="edit-password-confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        value={formData.password_confirmation}
                                        onChange={handleInputChange}
                                        placeholder="Konfirmasi password baru"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                                        <SelectTrigger id="edit-role">
                                            <SelectValue placeholder="Pilih role pengguna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="relawan">Relawan</SelectItem>
                                            <SelectItem value="masyarakat">Masyarakat</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select
                                        value={formData.status ? 'active' : 'inactive'}
                                        onValueChange={(value) => handleSelectChange('status', value)}
                                    >
                                        <SelectTrigger id="edit-status">
                                            <SelectValue placeholder="Pilih status pengguna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Aktif</SelectItem>
                                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit">Simpan Perubahan</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete User Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Pengguna</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="font-medium">{selectedUser?.name}</p>
                            <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteUser}>
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
