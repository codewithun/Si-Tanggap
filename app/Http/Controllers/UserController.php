<?php
// filepath: d:\laragon\www\PROJECT\Si-Tanggap\app\Http\Controllers\UserController.php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

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
        
        // Handle search functionality
        if ($request->filled('search')) {
            $searchTerm = $request->get('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('email', 'like', '%' . $searchTerm . '%');
            });
        }
        
        $users = $query->orderBy('created_at', 'desc')->paginate(10);
        
        // Append search parameter to pagination links
        $users->appends($request->only('search'));
        
        return Inertia::render('users/index', [
            'users' => $users,
            'search' => $request->get('search', ''),
            'filters' => [
                'search' => $request->get('search'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create()
    {
        $this->authorize('create', User::class);
        
        return Inertia::render('users/create');
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $this->authorize('create', User::class);
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', 'string', Rule::in(['masyarakat', 'relawan', 'admin'])],
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);

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
        
        return Inertia::render('users/edit', [
            'user' => $user->only(['id', 'name', 'email', 'role', 'created_at'])
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255', 
                Rule::unique('users')->ignore($user->id)
            ],
            'role' => ['required', 'string', Rule::in(['masyarakat', 'relawan', 'admin'])],
        ]);

        // Validate password only if provided
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
                'role' => $validated['role'],
            ]);

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
        
        // Get current authenticated user ID using Auth facade
        $currentUserId = Auth::id();
        
        // Alternative approaches (choose one):
        // Option 1: Using Auth facade (recommended)
        if ($currentUserId === $user->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan');
        }
        
        // Option 2: Using auth() helper with null check
        // if (auth()->user() && auth()->user()->id === $user->id) {
        //     return back()->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan');
        // }
        
        // Option 3: Using request user
        // if ($request->user() && $request->user()->id === $user->id) {
        //     return back()->with('error', 'Anda tidak dapat menghapus akun yang sedang digunakan');
        // }

        try {
            $user->delete();
            
            return redirect()->route('users.index')
                ->with('message', 'Pengguna berhasil dihapus');
                
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus pengguna: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified user (optional - for show page)
     */
    public function show(User $user)
    {
        $this->authorize('view', $user);
        
        return Inertia::render('users/show', [
            'user' => $user->only(['id', 'name', 'email', 'role', 'created_at', 'updated_at'])
        ]);
    }
}