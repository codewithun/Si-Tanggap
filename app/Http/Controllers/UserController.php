<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the users
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();

        if ($request->filled('search')) {
            $searchTerm = $request->get('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('email', 'like', '%' . $searchTerm . '%');
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);
        $users->appends($request->only('search'));

        // Ambil role user juga, karena pakai Spatie role
        $users->getCollection()->transform(function ($user) {
            $user->roles = $user->getRoleNames(); // collection of role names
            return $user;
        });

        return Inertia::render('users/index', [
            'users' => $users,
            'search' => $request->get('search', ''),
            'filters' => [
                'search' => $request->get('search'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create()
    {
        $this->authorize('create', User::class);

        // Ambil list role dari Spatie
        $roles = Role::pluck('name');

        return Inertia::render('users/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $roles = Role::pluck('name')->toArray();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in($roles)],
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            // Assign role via Spatie
            $user->assignRole($validated['role']);

            return redirect()->route('users.index')
                ->with('message', 'Pengguna berhasil ditambahkan');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Gagal menambahkan pengguna: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(User $user)
    {
        $this->authorize('update', $user);

        $roles = Role::pluck('name');

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(), // ambil role pertama saja, asumsi 1 role per user
                'created_at' => $user->created_at,
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $roles = Role::pluck('name')->toArray();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255', 
                Rule::unique('users')->ignore($user->id)
            ],
            'role' => ['required', 'string', Rule::in($roles)],
        ]);

        if ($request->filled('password')) {
            $passwordValidated = $request->validate([
                'password' => ['string', 'min:8', 'confirmed'],
            ]);
            $user->password = Hash::make($passwordValidated['password']);
        }

        try {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            // Sync role via Spatie
            $user->syncRoles([$validated['role']]);

            return redirect()->route('users.index')
                ->with('message', 'Pengguna berhasil diperbarui');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Gagal memperbarui pengguna: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $currentUserId = Auth::id();

        if ($currentUserId === $user->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan');
        }

        try {
            $user->delete();

            return redirect()->route('users.index')
                ->with('message', 'Pengguna berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus pengguna: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);

        return Inertia::render('users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
        ]);
    }
}
