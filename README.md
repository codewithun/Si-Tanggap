# GeoSiaga

# Laravel + React Project Setup Tutorial

This guide provides step-by-step instructions for installing, configuring, and running a Laravel backend with a React frontend.

## Prerequisites
Before starting, ensure you have the following installed:
- **PHP** (>= 8.1)
- **Composer** (latest version)
- **Node.js** (>= 16.x) and **npm** (or **yarn**)
- **MySQL** or any other database supported by Laravel
- **Git**

## Installation

### 1. Clone the Repository
Clone the project repository to your local machine:
```bash
git clone https://github.com/codewithun/Si-Tanggap.git
cd Si-Tanggap
```

### 2. Install Laravel Dependencies
Navigate to the project root and install PHP dependencies using Composer:
```bash
composer install
```

### 3. Install React Dependencies
Install the frontend dependencies using npm (or yarn):
```bash
npm install
```
or
```bash
yarn install
```

### 4. Configure Environment
Copy the `.env.example` file to `.env` and configure your environment variables (e.g., database connection):
```bash
cp .env.example .env
```

Edit the `.env` file to set your database credentials and other configurations:
```plaintext
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

Generate an application key for Laravel:
```bash
php artisan key:generate
```

### 5. Run Database Migrations
Run the migrations to set up the database schema:
```bash
php artisan migrate
```

(Optional) Seed the database with sample data:
```bash
php artisan db:seed
```

### 6. Build the Frontend
Compile the React frontend assets:
```bash
npm run dev
```
or for production:
```bash
npm run build
```

### 7. Start the Development Server
Run the Laravel development server:
```bash
php artisan serve
```

By default, the application will be available at `http://localhost:8000`.

For React development with hot reloading, run:
```bash
npm run watch
```

## Configuration

### Laravel Configuration
- **CORS**: If your React frontend is served from a different domain or port, configure CORS in `config/cors.php`:
  ```php
  'paths' => ['api/*'],
  'allowed_methods' => ['*'],
  'allowed_origins' => ['http://localhost:3000'], // Adjust to your React app URL
  'allowed_headers' => ['*'],
  'exposed_headers' => [],
  'max_age' => 0,
  'supports_credentials' => false,
  ```


### Directory Structure
```
your-repo/
├── app/                # Laravel backend logic
├── resources/
│   ├── js/            # React frontend source code
│   ├── views/         # Blade templates (optional)
├── public/            # Compiled frontend assets
├── routes/            # Laravel routes (api.php, web.php)
├── database/          # Migrations and seeders
├── .env               # Environment configuration
├── package.json       # Frontend dependencies
├── composer.json      # Backend dependencies
```

## Running the Application
- Backend: Run `php artisan serve` to start the Laravel server.
- Frontend: Run `npm run watch` for development or `npm run build` for production.
- Access the application at `http://localhost:8000` (or your configured URL).


## Contributing
To contribute, please fork the repository, create a feature branch, and submit a pull request.

## License
This project is licensed under the MIT License.
