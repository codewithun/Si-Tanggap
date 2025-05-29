<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class EmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $title;
    protected $content;
    protected $type;

    /**
     * Create a new notification instance.
     */
    public function __construct($title, $content, $type = 'info')
    {
        $this->title = $title;
        $this->content = $content;
        $this->type = $type;

        // Log that we're creating an email notification
        Log::info('Creating email notification', [
            'title' => $title,
            'type' => $type
        ]);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Make sure the mail channel is used
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        Log::info('Preparing to send email to: ' . $notifiable->email);

        $mailMessage = (new MailMessage)
            ->subject('[GeoSiaga] ' . $this->title)
            ->greeting('Halo ' . $notifiable->name)
            ->line($this->content)
            ->line('Notifikasi ini dikirim dari aplikasi GeoSiaga.')
            ->action('Buka Aplikasi GeoSiaga', url('/'));

        // Add different styling based on notification type
        if ($this->type === 'warning') {
            $mailMessage->subject('[Peringatan] ' . $this->title);
        } elseif ($this->type === 'emergency') {
            $mailMessage->error();
        }

        return $mailMessage;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'content' => $this->content,
            'type' => $this->type,
        ];
    }
}
