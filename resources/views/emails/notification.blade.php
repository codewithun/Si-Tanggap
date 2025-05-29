<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .logo {
            max-width: 150px;
            margin: 0 auto;
            display: block;
        }

        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }

        .footer {
            font-size: 12px;
            text-align: center;
            color: #777;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3490dc;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }

        .info-box {
            border-left: 4px solid #3490dc;
            padding: 10px 15px;
            background-color: #ebf5ff;
        }

        .warning-box {
            border-left: 4px solid #f6ad55;
            padding: 10px 15px;
            background-color: #fffaf0;
        }

        .emergency-box {
            border-left: 4px solid #e53e3e;
            padding: 10px 15px;
            background-color: #fff5f5;
        }
    </style>
</head>

<body>
    <div class="header">
        <img src="{{ asset('img/logo.png') }}" alt="GeoSiaga Logo" class="logo">
        <h2>GeoSiaga Notification</h2>
    </div>

    <div class="content">
        <h2>{{ $title }}</h2>

        <div class="{{ $type }}-box">
            <p>{!! nl2br(e($content)) !!}</p>
        </div>

        <p>Notifikasi ini dikirim dari aplikasi GeoSiaga.</p>

        <div style="text-align: center; margin-top: 30px;">
            <a href="{{ url('/') }}" class="btn">Buka Aplikasi GeoSiaga</a>
        </div>
    </div>

    <div class="footer">
        <p>&copy; {{ date('Y') }} GeoSiaga. All rights reserved.</p>
        <p>Jika Anda menerima email ini secara tidak sengaja, mohon abaikan.</p>
    </div>
</body>

</html>