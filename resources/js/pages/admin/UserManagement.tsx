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
import { CheckIcon, EyeIcon, PencilIcon, Trash2Icon, UserPlusIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../hooks/useToast';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    phone?: string;
    profile_photo_path?: string;
    id_card_path?: string;
    organization?: string;
    experience?: string;
    motivation?: string;
    email_verified_at?: string;
    google_id?: string;
    avatar?: string;
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
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [rejectingUserId, setRejectingUserId] = useState<number | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        role: string;
        status: string; // Changed from boolean to string
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'masyarakat',
        status: 'active', // Default to active
    });

    const { toast } = useToast();

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get('/admin/users/data');

            // Periksa format response
            if (Array.isArray(response.data)) {
                // Format response langsung array
                setUsers(response.data);
            } else if (response.data && Array.isArray(response.data.data)) {
                // Format response { data: [...] }
                setUsers(response.data.data);
            } else {
                // Format tidak dikenal, log dan set array kosong
                console.error('Format response tidak dikenali:', response.data);
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data pengguna',
                variant: 'destructive',
            });
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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'masyarakat',
            status: 'active',
        });
        setSelectedUser(null);
    };

    // Prepare to reject a volunteer
    const prepareRejectVolunteer = (userId: number) => {
        setRejectingUserId(userId);
        setIsRejectDialogOpen(true);
    };

    // Function to verify a volunteer
    const handleVerifyVolunteer = async (userId: number) => {
        try {
            await axios.post(`/admin/relawans/${userId}/verify`);
            toast({
                title: 'Berhasil',
                description: 'Relawan berhasil diverifikasi',
            });
            fetchUsers();
        } catch (error) {
            console.error('Failed to verify volunteer:', error);
            toast({
                title: 'Error',
                description: 'Gagal memverifikasi relawan',
                variant: 'destructive',
            });
        }
    };

    // Function to reject a volunteer
    const handleRejectVolunteer = async () => {
        if (!rejectingUserId) return;

        try {
            await axios.post(`/admin/relawans/${rejectingUserId}/reject`);
            toast({
                title: 'Berhasil',
                description: 'Pendaftaran relawan ditolak dan akun dihapus',
            });
            setIsRejectDialogOpen(false);
            setRejectingUserId(null);
            fetchUsers();
        } catch (error) {
            console.error('Failed to reject volunteer:', error);
            toast({
                title: 'Error',
                description: 'Gagal menolak pendaftaran relawan',
                variant: 'destructive',
            });
        }
    };

    // Rest of your existing functions
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Log data yang akan dikirim
            console.log('Mengirim data pengguna baru:', formData);

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

            // Show detailed validation errors if available
            if (axios.isAxiosError(error) && error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);

                if (error.response.data.errors) {
                    const validationErrors = Object.values(error.response.data.errors as Record<string, string[]>).flat();
                    toast({
                        title: 'Error Validasi',
                        description: validationErrors.join(', '),
                        variant: 'destructive',
                    });
                } else if (error.response.data.message) {
                    toast({
                        title: 'Error',
                        description: error.response.data.message,
                        variant: 'destructive',
                    });
                }
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
            const userId = selectedUser.id;
            const updateUrl = `/admin/users/${userId}`;

            const requestData = {
                ...updateData,
                _method: 'PATCH',
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
            const deleteUrl = `/admin/users/${selectedUser.id}`;
            await axios.post(deleteUrl, {
                _method: 'DELETE',
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

    const showUserDetail = (user: User) => {
        setSelectedUser(user);
        setIsDetailDialogOpen(true);
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Function to get status display class and text
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'active':
                return {
                    class: 'bg-green-100 text-green-800',
                    text: 'Aktif',
                };
            case 'pending':
                return {
                    class: 'bg-yellow-100 text-yellow-800',
                    text: 'Menunggu Verifikasi',
                };
            case 'rejected':
                return {
                    class: 'bg-red-100 text-red-800',
                    text: 'Ditolak',
                };
            default:
                return {
                    class: 'bg-gray-100 text-gray-800',
                    text: status,
                };
        }
    };

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
                                            <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                                                <SelectTrigger id="status">
                                                    <SelectValue placeholder="Pilih status pengguna" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Aktif</SelectItem>
                                                    <SelectItem value="pending">Menunggu Verifikasi</SelectItem>
                                                    <SelectItem value="rejected">Ditolak</SelectItem>
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
                                            <TableHead className="text-center">Aksi</TableHead>
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
                                            users.map((user) => {
                                                const statusDisplay = getStatusDisplay(user.status);
                                                const isPendingRelawan = user.role === 'relawan' && user.status === 'pending';
                                                const isRejectedRelawan = user.role === 'relawan' && user.status === 'rejected';

                                                return (
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
                                                            <span className={`rounded-full px-2 py-1 text-xs ${statusDisplay.class}`}>
                                                                {statusDisplay.text}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <div className="flex justify-center space-x-2">
                                                                {isPendingRelawan && (
                                                                    <>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="bg-green-50 text-green-600 hover:bg-green-100"
                                                                            onClick={() => handleVerifyVolunteer(user.id)}
                                                                        >
                                                                            <CheckIcon className="h-4 w-4" />
                                                                            <span className="sr-only">Verifikasi</span>
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="bg-red-50 text-red-600 hover:bg-red-100"
                                                                            onClick={() => prepareRejectVolunteer(user.id)}
                                                                        >
                                                                            <XIcon className="h-4 w-4" />
                                                                            <span className="sr-only">Tolak</span>
                                                                        </Button>
                                                                    </>
                                                                )}

                                                                {isRejectedRelawan && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="bg-orange-50 text-orange-600 hover:bg-orange-100"
                                                                        onClick={() => showUserDetail(user)}
                                                                        title="Lihat detail pengajuan yang ditolak"
                                                                    >
                                                                        <span className="text-xs">Ditolak</span>
                                                                    </Button>
                                                                )}
                                                                <Button variant="outline" size="sm" onClick={() => showUserDetail(user)}>
                                                                    <EyeIcon className="h-4 w-4" />
                                                                    <span className="sr-only">Detail</span>
                                                                </Button>
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
                                                );
                                            })
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
                                    <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                                        <SelectTrigger id="edit-status">
                                            <SelectValue placeholder="Pilih status pengguna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Aktif</SelectItem>
                                            <SelectItem value="pending">Menunggu Verifikasi</SelectItem>
                                            <SelectItem value="rejected">Ditolak</SelectItem>
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

                {/* Reject Volunteer Dialog */}
                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tolak Pendaftaran Relawan</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menolak pendaftaran relawan ini?
                                <strong className="mt-2 block text-red-600">
                                    Akun pengguna akan dihapus dan email dapat digunakan kembali untuk pendaftaran.
                                </strong>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleRejectVolunteer}>
                                Tolak & Hapus Akun
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* User Detail Dialog - Updated to display all available data */}
                <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                    <DialogContent className="max-w-md sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Detail Pengguna</DialogTitle>
                            <DialogDescription>Informasi lengkap tentang pengguna</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto py-4">
                            {selectedUser && (
                                <div className="space-y-4">
                                    {/* Basic Information */}
                                    <h4 className="text-sm font-semibold text-gray-500">Informasi Dasar</h4>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Nama</div>
                                        <div className="col-span-2">{selectedUser.name || '-'}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Email</div>
                                        <div className="col-span-2">{selectedUser.email || '-'}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">No. Telepon</div>
                                        <div className="col-span-2">{selectedUser.phone || '-'}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Role</div>
                                        <div className="col-span-2">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${
                                                    selectedUser.role === 'admin'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : selectedUser.role === 'relawan'
                                                          ? 'bg-green-100 text-green-800'
                                                          : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {selectedUser.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Status</div>
                                        <div className="col-span-2">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${
                                                    selectedUser.status ? getStatusDisplay(selectedUser.status).class : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {selectedUser.status ? getStatusDisplay(selectedUser.status).text : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Profile Photo */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Foto Profil</div>
                                        <div className="col-span-2">
                                            {selectedUser.profile_photo_path ? (
                                                <div className="relative h-24 w-24 overflow-hidden rounded-full">
                                                    <img
                                                        src={`/storage/${selectedUser.profile_photo_path}`}
                                                        alt="Foto profil"
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback if image doesn't load
                                                            (e.target as HTMLImageElement).src =
                                                                selectedUser.avatar ||
                                                                'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.name);
                                                        }}
                                                    />
                                                </div>
                                            ) : selectedUser.avatar ? (
                                                <div className="relative h-24 w-24 overflow-hidden rounded-full">
                                                    <img
                                                        src={selectedUser.avatar}
                                                        alt="Avatar"
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback if image doesn't load
                                                            (e.target as HTMLImageElement).src =
                                                                'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.name);
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Relawan Information - Show always but mark as N/A if not available */}
                                    <hr className="my-2" />
                                    <h4 className="text-sm font-semibold text-gray-500">Informasi Relawan</h4>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Organisasi</div>
                                        <div className="col-span-2">{selectedUser.organization || 'Tidak ada'}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Pengalaman</div>
                                        <div className="col-span-2">{selectedUser.experience || 'Tidak ada'}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Motivasi</div>
                                        <div className="col-span-2">{selectedUser.motivation || 'Tidak ada'}</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">KTP</div>
                                        <div className="col-span-2">
                                            {selectedUser.id_card_path ? (
                                                <a
                                                    href={`/storage/${selectedUser.id_card_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Lihat KTP
                                                </a>
                                            ) : (
                                                'Tidak ada'
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <hr className="my-2" />
                                    <h4 className="text-sm font-semibold text-gray-500">Informasi Tambahan</h4>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Verifikasi Email</div>
                                        <div className="col-span-2">
                                            {selectedUser.email_verified_at ? (
                                                <span className="text-green-600">Terverifikasi</span>
                                            ) : (
                                                <span className="text-yellow-600">Belum Diverifikasi</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="font-semibold">Login Google</div>
                                        <div className="col-span-2">
                                            {selectedUser.google_id ? (
                                                <span className="text-green-600">Terhubung</span>
                                            ) : (
                                                <span className="text-gray-600">Tidak Terhubung</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" onClick={() => setIsDetailDialogOpen(false)}>
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
