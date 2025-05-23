<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use App\Notifications\EmergencyNotification;

class NotifikasiController extends Controller
{
    /**
     * Send a notification to all users
     */
    public function send(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'isi' => 'required|string',
        ]);

        // Get all users (or you could filter by specific criteria)
        $users = User::where('status', true)->get();

        // Send notification to all users
        Notification::send($users, new EmergencyNotification(
            $request->judul,
            $request->isi
        ));

        return response()->json([
            'success' => true,
            'message' => 'Notification sent successfully to ' . $users->count() . ' users',
        ]);
    }
}
