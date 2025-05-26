<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'profile_photo_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the laporan for the user.
     */
    public function laporans()
    {
        return $this->hasMany(Laporan::class);
    }

    /**
     * Get the jalur evakuasi for the user.
     */
    public function jalurEvakuasis()
    {
        return $this->hasMany(JalurEvakuasi::class);
    }

    /**
     * Get the posko for the user.
     */
    public function poskos()
    {
        return $this->hasMany(Posko::class);
    }

    /**
     * Custom helper to check role using Spatie.
     */
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
