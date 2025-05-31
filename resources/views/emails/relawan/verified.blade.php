<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no">
    <meta name="format-detection" content="date=no">
    <title>Akun Relawan Diverifikasi</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
        }
        .header {
            background-color: #10b981;
            color: white;
            padding: 15px 20px;
            text-align: center;
            font-weight: bold;
            font-size: 22px;
        }
        .content {
            padding: 20px;
        }
        .footer {
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
        .success-box {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #10b981;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            VERIFIKASI RELAWAN
        </div>
        <div class="content">
            <!-- Tambah text pra-header untuk meningkatkan deliverability -->
            <div style="display: none; max-height: 0px; overflow: hidden;">
                Selamat! Akun relawan Anda telah diverifikasi dan diaktifkan.
            </div>
            
            <p>Halo <strong>{{ $name }}</strong>,</p>
            
            <div class="success-box">
                <h2>Akun Relawan Anda Telah Diverifikasi</h2>
                <p>Selamat! Akun relawan Anda telah berhasil diverifikasi oleh tim admin kami. Anda sekarang dapat mengakses fitur-fitur khusus relawan pada aplikasi.</p>
            </div>
            
            <p><strong>Langkah selanjutnya:</strong></p>
            <ul>
                <li>Login ke akun Anda untuk mengakses fitur relawan</li>
                <li>Mulai berpartisipasi dalam kegiatan relawan</li>
            </ul>
            
            <p>Terima kasih atas kesediaan Anda menjadi relawan. Kontribusi Anda sangat berarti bagi masyarakat.</p>
            
            <p>Salam,<br><strong>Tim GeoSiaga</strong></p>
        </div>
        <div class="footer">
            <p>Anda menerima email ini karena terdaftar sebagai relawan di aplikasi GeoSiaga.</p>
            <p>Untuk bantuan, silakan hubungi <a href="mailto:geosiaga@gmail.com">geosiaga@gmail.com</a></p>
            <p>© {{ date('Y') }} GeoSiaga</p>
        </div>
    </div>
</body>
</html> 