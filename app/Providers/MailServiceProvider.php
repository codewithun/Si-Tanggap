<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Mail\Events\MessageSending;

class MailServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */    public function register()
    {
        // Register custom mail transport with DKIM support if needed
    }
    
    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        // Tambah event listener untuk mengubah email sebelum dikirim
        \Illuminate\Support\Facades\Event::listen(\Illuminate\Mail\Events\MessageSending::class, function ($event) {
            $message = $event->message;
            
            // Tambahkan header umum yang meningkatkan reputasi email
            $headers = $message->getHeaders();
            $headers->addTextHeader('List-Id', 'GeoSiaga <notifications.geosiaga.com>');
            $headers->addTextHeader('X-Entity-Ref-ID', uniqid('geosiaga-', true));
            $headers->addTextHeader('X-Report-Abuse', 'Please report abuse at https://geosiaga.com/report-abuse');
            $headers->addTextHeader('X-CSA-Complaints', 'abuse@geosiaga.com');
            $headers->addTextHeader('Feedback-ID', 'notifications:geosiaga');
        });
    }
}
