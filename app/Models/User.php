<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'profile_photo_path',
        'id_card_path',
        'organization',
        'experience',
        'motivation',
        'email_verified_at',
        'google_id',
        'avatar',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function laporans()
    {
        return $this->hasMany(Laporan::class);
    }

    public function jalurEvakuasis()
    {
        return $this->hasMany(JalurEvakuasi::class);
    }

    public function poskos()
    {
        return $this->hasMany(Posko::class);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isRelawan(): bool
    {
        return $this->hasRole('relawan');
    }

    public function isMasyarakat(): bool
    {
        return $this->hasRole('masyarakat');
    }
}
