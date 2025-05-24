<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
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
     * Check if the user is an admin.
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if the user is a relawan.
     *
     * @return bool
     */
    public function isRelawan(): bool
    {
        return $this->role === 'relawan';
    }

    /**
     * Check if the user is a masyarakat.
     *
     * @return bool
     */
    public function isMasyarakat(): bool
    {
        return $this->role === 'masyarakat';
    }

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
}
