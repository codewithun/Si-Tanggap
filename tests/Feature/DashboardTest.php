<?php

use App\Models\User;

beforeEach(function () {
    // Ensure the required roles exist before each test
    createRoles();
});

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});