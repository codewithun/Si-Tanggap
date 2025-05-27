<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }
    
    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterCreating(function ($user) {
            // Assign the masyarakat role by default
            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                try {
                    // First ensure the role exists
                    if (\Spatie\Permission\Models\Role::where('name', 'masyarakat')->doesntExist()) {
                        \Spatie\Permission\Models\Role::create(['name' => 'masyarakat']);
                    }
                    
                    $user->assignRole('masyarakat');
                } catch (\Exception $e) {
                    // If role assignment fails, log the error but continue
                    report($e);
                }
            }
        });
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
