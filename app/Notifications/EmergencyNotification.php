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
    protected $content;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $title, string $content)
    {
        $this->title = $title;
        $this->content = $content;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $message = new MailMessage;
        $message->from(config('mail.from.address'), config('mail.from.name'));
        $message->replyTo('info@geosiaga.com', 'Info GeoSiaga');
        $message->subject('PENTING: ' . $this->title);
        $message->greeting('Halo ' . $notifiable->name . ',');
        $message->line('**INFORMASI PENTING KEBENCANAAN:**');
        $message->line($this->content);
        $message->line('**Harap tetap waspada dan ikuti arahan dari petugas terkait.**');
        $message->action('Lihat Detail di Aplikasi', url('/dashboard'));
        $message->line('Pesan ini dikirim melalui sistem notifikasi GeoSiaga.');
        $message->salutation('Salam,<br>Tim GeoSiaga');
        $message->priority(1);
        
        // Setting header khusus untuk menghindari spam filter
        $message->withSymfonyMessage(function ($message) {
            $message->getHeaders()
                ->addTextHeader('X-Priority', '1')
                ->addTextHeader('X-MSMail-Priority', 'High')
                ->addTextHeader('Importance', 'High')
                ->addTextHeader('X-Auto-Response-Suppress', 'OOF, DR, RN, NRN, AutoReply')
                ->addTextHeader('Precedence', 'urgent')
                ->addTextHeader('X-Entity-Ref-ID', uniqid('geosiaga-', true));
        });
        
        return $message;
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
            'type' => 'emergency',
        ];
    }
}
