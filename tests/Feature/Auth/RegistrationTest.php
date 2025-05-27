<?php

use App\Models\User;


test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    // Create the roles first to ensure they exist
    createRoles();
    
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'phone' => '1234567890', // Added phone field
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('masyarakat.dashboard', absolute: false));
});
