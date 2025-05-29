<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $title;
    public $content;
    public $type;

    /**
     * Create a new message instance.
     */
    public function __construct(string $title, string $content, string $type = 'info')
    {
        $this->title = $title;
        $this->content = $content;
        $this->type = $type;

        Log::info('Creating notification email', ['title' => $title, 'type' => $type]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[GeoSiaga] ' . $this->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.notification',
            with: [
                'title' => $this->title,
                'content' => $this->content,
                'type' => $this->type,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        Log::info('Building email with subject: [GeoSiaga] ' . $this->title);

        return $this->subject('[GeoSiaga] ' . $this->title)
            ->view('emails.notification');
    }
}
