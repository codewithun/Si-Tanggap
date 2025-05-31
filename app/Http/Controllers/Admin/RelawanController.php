<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Mail\RelawanRejected;
use App\Mail\RelawanVerified;
use Inertia\Inertia;

class RelawanController extends Controller
{
    /**
     * Allow rejected relawan to resubmit their application
     */
    public function resubmit(Request $request)
    {
        // Get the authenticated user
        $user = Auth::user();

        // Log untuk debugging
        Log::info('User resubmit attempt', [
            'user_id' => $user->id,
            'has_role_relawan' => $user->hasRole('relawan'),
            'status' => $user->status,
            'roles' => $user->roles->pluck('name')
        ]);

        // Validasi yang lebih ketat: harus memiliki role relawan dan status rejected
        if (!$user->hasRole('relawan') || $user->status !== 'rejected') {
            return response()->json([
                'message' => 'Tidak dapat mengajukan ulang. User bukan relawan yang ditolak.',
                'details' => [
                    'hasRoleRelawan' => $user->hasRole('relawan'),
                    'status' => $user->status
                ]
            ], 400);
        }

        // Validate the request data
        $validated = $request->validate([
            'organization' => 'nullable|string|max:255',
            'experience' => 'nullable|string',
            'motivation' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
        ]);

        // Update the user information
        $user->organization = $validated['organization'] ?? $user->organization;
        $user->experience = $validated['experience'] ?? $user->experience;
        $user->motivation = $validated['motivation'] ?? $user->motivation;
        $user->phone = $validated['phone'] ?? $user->phone;

        // Process ID card upload if provided
        if ($request->hasFile('id_card')) {
            $path = $request->file('id_card')->store('id_cards', 'public');
            $user->id_card_path = '/storage/' . $path;
        }

        // Change status back to pending
        $user->status = 'pending';
        $user->save();

        return response()->json(['message' => 'Pengajuan relawan berhasil dikirimkan ulang.']);
    }

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
     * Reject a relawan application.
     */
    public function reject($id)
    {
        $user = User::findOrFail($id);

        if (!$user->hasRole('relawan')) {
            return response()->json(['message' => 'User bukan relawan'], 400);
        }

        // Update user status to rejected instead of deleting
        $user->status = 'rejected';
        $user->save();        // Send email notification to relawan
        try {
            // We'll modify the email to include instructions on how to reapply
            Mail::to($user->email)->send(new RelawanRejected($user->name, $user->email));
        } catch (\Exception $e) {
            Log::error("Failed to send rejection email: " . $e->getMessage());
        }

        return response()->json(['message' => 'Permintaan relawan ditolak. User dapat memperbaiki data dan mengajukan ulang.']);

        // We're no longer deleting the user account
    }

    /**
     * Get data for rejected relawan (migrated from Api\RelawanController)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRejectedRelawanData(Request $request)
    {
        $user = $request->user();

        // Log the request for debugging
        Log::info('Rejected relawan data request', [
            'user_id' => $user->id,
            'email' => $user->email,
            'is_relawan' => $user->hasRole('relawan'),
            'status' => $user->status
        ]);

        // Check if the user is a relawan with rejected status
        if (!$user->hasRole('relawan') || $user->status !== 'rejected') {
            return response()->json([
                'message' => 'Unauthorized',
                'reason' => 'User is not a rejected relawan'
            ], 403);
        }

        // Return the user data
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'organization' => $user->organization,
            'experience' => $user->experience,
            'motivation' => $user->motivation,
            'id_card_path' => $user->id_card_path,
            'status' => $user->status
        ]);
    }

    /**
     * Get data for rejected relawan (public endpoint)
     * This allows rejected users to access their data on the public registration-rejected page
     */
    public function getRejectedRelawanDataPublic($email)
    {
        // Find user by email
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // Check if the user is a relawan with rejected status
        if (!$user->hasRole('relawan') || $user->status !== 'rejected') {
            return response()->json([
                'message' => 'Access denied. Only rejected relawan can access this data.',
                'details' => [
                    'is_relawan' => $user->hasRole('relawan'),
                    'status' => $user->status
                ]
            ], 403);
        }

        // Return the user data (same as the authenticated version)
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'organization' => $user->organization,
            'experience' => $user->experience,
            'motivation' => $user->motivation,
            'id_card_path' => $user->id_card_path,
            'status' => $user->status
        ]);
    }

    /**
     * Allow rejected relawan to resubmit their application (public endpoint)
     * This allows rejected users to resubmit on the public registration-rejected page
     */
    public function resubmitPublic(Request $request)
    {
        // Validate the request data including email
        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'organization' => 'nullable|string|max:255',
            'experience' => 'nullable|string',
            'motivation' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
        ]);

        // Find user by email
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.'
            ], 404);
        }

        // Log untuk debugging
        Log::info('Public resubmit attempt', [
            'user_id' => $user->id,
            'email' => $user->email,
            'has_role_relawan' => $user->hasRole('relawan'),
            'status' => $user->status,
            'roles' => $user->roles->pluck('name')
        ]);

        // Validasi yang lebih ketat: harus memiliki role relawan dan status rejected
        if (!$user->hasRole('relawan') || $user->status !== 'rejected') {
            return response()->json([
                'message' => 'Tidak dapat mengajukan ulang. User bukan relawan yang ditolak.',
                'details' => [
                    'hasRoleRelawan' => $user->hasRole('relawan'),
                    'status' => $user->status
                ]
            ], 400);
        }

        // Update the user information
        $user->name = $validated['name'];
        $user->organization = $validated['organization'] ?? $user->organization;
        $user->experience = $validated['experience'] ?? $user->experience;
        $user->motivation = $validated['motivation'] ?? $user->motivation;
        $user->phone = $validated['phone'] ?? $user->phone;

        // Process ID card upload if provided
        if ($request->hasFile('id_card')) {
            $path = $request->file('id_card')->store('id_cards', 'public');
            $user->id_card_path = '/storage/' . $path;
        }

        // Change status back to pending
        $user->status = 'pending';
        $user->save();

        return response()->json(['message' => 'Pengajuan relawan berhasil dikirimkan ulang.']);
    }
}
