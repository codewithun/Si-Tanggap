<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('webgis/landing');
})->name('home');

// WebGIS Routes
Route::prefix('webgis')->group(function () {
    Route::get('/', function () {
        return Inertia::render('webgis/landing');
    })->name('webgis.landing');

    Route::get('/map', function () {
        return Inertia::render('webgis/map');
    })->name('webgis.map');

    Route::get('/reports', function () {
        return Inertia::render('webgis/reports');
    })->name('webgis.reports');

    Route::get('/reports/create', function () {
        return Inertia::render('webgis/reports/create');
    })->name('webgis.reports.create');

    Route::get('/data', function () {
        return Inertia::render('webgis/data');
    })->name('webgis.data');

    Route::get('/about', function () {
        return Inertia::render('webgis/about');
    })->name('webgis.about');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
