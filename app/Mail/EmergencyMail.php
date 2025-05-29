<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

class EmergencyMail extends Mailable
{
    use Queueable, SerializesModels;

    public $title;
    public $content;
    public $recipientName;

    /**
     * Create a new message instance.
     */    public function __construct(string $title, string $content, string $recipientName)
    {
        $this->title = $title;
        $this->content = $content;
        $this->recipientName = $recipientName;
    }
    
    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'PENTING: ' . $this->title,
            tags: ['emergency', 'notification', 'alert'],
            metadata: [
                'category' => 'emergency_alert',
                'importance' => 'high',
                'auto_response_suppress' => 'OOF, DR, RN, NRN, AutoReply',
                'system' => 'GeoSiaga',
            ],
            replyTo: 'info@geosiaga.com',
        );
    }

    /**
     * Get the message headers.
     */
    public function headers(): Headers
    {
        return new Headers(
            text: [
                'X-Priority' => '1 (Highest)',                'X-MSMail-Priority' => 'High',
                'Importance' => 'High',
                'Precedence' => 'urgent',
                'X-Mailer' => 'GeoSiaga System 1.0',
                'X-Auto-Response-Suppress' => 'OOF, DR, RN, NRN, AutoReply',
                'List-Unsubscribe' => '<mailto:unsubscribe@geosiaga.com?subject=unsubscribe>, <https://geosiaga.com/unsubscribe>',
                'List-Unsubscribe-Post' => 'List-Unsubscribe=One-Click',
                'X-Report-Abuse' => 'Please report abuse at https://geosiaga.com/report-abuse',
                'Feedback-ID' => 'emergency:geosiaga',
                'X-Entity-Ref-ID' => uniqid('geosiaga-', true),
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.emergency',
            with: [
                'title' => $this->title,
                'content' => $this->content,
                'name' => $this->recipientName
            ],
        );
    }
}
