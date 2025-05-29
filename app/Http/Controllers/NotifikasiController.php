<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use App\Notifications\EmergencyNotification;
use App\Notifications\EmailNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Mail;

class NotifikasiController extends Controller
{
    /**
     * Send a notification to all users
     */
    public function send(Request $request)
    {
        try {
            $request->validate([
                'judul' => 'required|string|max:255',
                'isi' => 'required|string',
                'type' => 'nullable|string|in:info,warning,emergency',
                'useEmail' => 'nullable|boolean',
                'target' => 'nullable|string|in:all,masyarakat,relawan',
            ]);

            $type = $request->type ?? 'info';
            $useEmail = $request->useEmail ?? false;
            $target = $request->target ?? 'all';

            // Get users based on target
            $query = User::query();

            if ($target !== 'all') {
                try {
                    // Use proper method depending on how roles are stored
                    if (method_exists(User::class, 'role')) {
                        $query->role($target);
                    } else {
                        $query->where('role', $target);
                    }
                } catch (\Exception $e) {
                    Log::error('Error filtering users by role: ' . $e->getMessage());
                    // Continue with all users if role filtering fails
                }
            }

            $users = $query->get();

            if ($users->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada pengguna yang sesuai dengan target',
                ], 404);
            }

            Log::info('Found ' . $users->count() . ' users for notification');

            // For in-app notifications, check if the database notifications table exists
            $hasNotificationsTable = Schema::hasTable('notifications');

            if ($hasNotificationsTable) {
                // Send in-app notification to all users
                try {
                    Notification::send($users, new EmergencyNotification(
                        $request->judul,
                        $request->isi
                    ));
                    Log::info('In-app notifications sent successfully');
                } catch (\Exception $e) {
                    Log::error('Error sending in-app notification: ' . $e->getMessage());
                    // Continue with email notifications even if in-app fails
                }
            }

            // If email notification is enabled, send email as well
            if ($useEmail) {
                try {
                    // Log mail configuration
                    Log::info('Mail configuration', [
                        'driver' => config('mail.default'),
                        'host' => config('mail.mailers.smtp.host'),
                        'port' => config('mail.mailers.smtp.port'),
                        'from_address' => config('mail.from.address'),
                        'username' => config('mail.mailers.smtp.username'),
                    ]);

                    // Send individual emails to avoid exposure of email addresses
                    foreach ($users as $user) {
                        if (!$user->email) {
                            Log::warning("User {$user->id} ({$user->name}) has no email address");
                            continue;
                        }

                        Log::info("Sending email to user {$user->id} ({$user->name}): {$user->email}");

                        try {
                            // Try direct mail first
                            Mail::to($user)->send(new \App\Mail\NotificationMail(
                                $request->judul,
                                $request->isi,
                                $type
                            ));
                        } catch (\Exception $mailException) {
                            Log::error("Failed to send direct mail to {$user->email}: " . $mailException->getMessage());

                            // Try notification facade as fallback
                            try {
                                $user->notify(new EmailNotification(
                                    $request->judul,
                                    $request->isi,
                                    $type
                                ));
                                Log::info("Email notification sent to {$user->email} via notification facade");
                            } catch (\Exception $notifyException) {
                                Log::error("Failed to notify {$user->email}: " . $notifyException->getMessage());
                            }
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Error sending email notifications: ' . $e->getMessage());
                    Log::error($e->getTraceAsString());

                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal mengirim notifikasi email: ' . $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ], 500);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil dikirim ke ' . $users->count() . ' pengguna',
                'emailSent' => $useEmail,
                'targetGroup' => $target,
                'inAppSent' => $hasNotificationsTable,
            ]);
        } catch (\Exception $e) {
            Log::error('Error in NotifikasiController@send: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengirim notifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
