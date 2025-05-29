<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmergencyNotification extends Notification
{
    use Queueable;

    protected $title;
    protected $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $title, string $message)
    {
        $this->title = $title;
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }
    
    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('PENTING: ' . $this->title)
            ->greeting('Halo ' . $notifiable->name)
            ->line($this->message)
            ->line('Notifikasi darurat ini dikirim dari aplikasi GeoSiaga.')
            ->action('Buka Aplikasi GeoSiaga', url('/'))
            ->error();
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
            'message' => $this->message,
            'time' => now()->toIsoString(),
        ];
    }
}
