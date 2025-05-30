<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\RelawanRejected;
use App\Mail\RelawanVerified;
use Inertia\Inertia;

class RelawanController extends Controller
{
    /**
     * Display a listing of relawan users.
     */
    public function index(Request $request)
    {
        $query = User::role('relawan')->with(['roles']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        $relawans = $query->latest()->paginate(10);

        return Inertia::render('admin/relawan/index', [
            'relawans' => $relawans,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Display the specified relawan details.
     */
    public function show($id)
    {
        $relawan = User::role('relawan')->findOrFail($id);

        return Inertia::render('admin/relawan/show', [
            'relawan' => $relawan,
        ]);
    }

    /**
     * Verify a relawan.
     */
    public function verify($id)
    {
        $user = User::findOrFail($id);
        
        if (!$user->hasRole('relawan')) {
            return response()->json(['message' => 'User bukan relawan'], 400);
        }
        
        $user->status = 'active';
        $user->save();
        
        // Send email notification to relawan
        try {
            Mail::to($user->email)->send(new RelawanVerified($user));
        } catch (\Exception $e) {
            Log::error("Failed to send verification email: " . $e->getMessage());
        }
        
        return response()->json(['message' => 'Relawan berhasil diverifikasi']);
    }

    /**
     * Reject a relawan and delete their account.
     */
    public function reject($id)
    {
        $user = User::findOrFail($id);
        
        if (!$user->hasRole('relawan')) {
            return response()->json(['message' => 'User bukan relawan'], 400);
        }
        
        // Store email for notification before deleting
        $userEmail = $user->email;
        $userName = $user->name;
        
        // Send email notification to relawan first
        try {
            // We'll need to create a modified version of RelawanRejected that doesn't need the User model
            Mail::to($userEmail)->send(new RelawanRejected($userName));
        } catch (\Exception $e) {
            Log::error("Failed to send rejection email: " . $e->getMessage());
        }
        
        // Delete the user account
        try {
            // Remove roles first to avoid foreign key issues
            $user->roles()->detach();
            
            // Delete the user
            $user->delete();
            
            return response()->json(['message' => 'Permintaan relawan ditolak dan akun dihapus.']);
        } catch (\Exception $e) {
            Log::error("Failed to delete rejected volunteer: " . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat menghapus akun relawan.'], 500);
        }
    }
}
