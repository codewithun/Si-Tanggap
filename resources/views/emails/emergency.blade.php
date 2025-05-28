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
    <title>Pemberitahuan Penting dari GeoSiaga</title>
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
            background-color: #dc2626;
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
        .alert-box {
            background-color: #ffecec;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
        }
        .logo {
            text-align: center;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>    <div class="container">
        <div class="header">
            INFORMASI PENTING BENCANA
        </div>
        <div class="content">
            <div class="logo">
                <!-- Gunakan URL absolut untuk gambar public -->
                <img src="{{ url('icons/posko.png') }}" alt="Logo GeoSiaga" width="150">
            </div>
            
            <!-- Tambah text pra-header untuk meningkatkan deliverability -->
            <div style="display: none; max-height: 0px; overflow: hidden;">
                Informasi penting terkait kebencanaan di wilayah Anda. Harap dibaca segera.
            </div>
            
            <p>Halo <strong>{{ $name }}</strong>,</p>
            
            <div class="alert-box">
                <h2>{{ $title }}</h2>
                <p>{{ $content }}</p>
            </div>
            
            <p><strong>Tindakan yang disarankan:</strong></p>
            <ul>
                <li>Harap tetap waspada dan ikuti arahan dari petugas terkait</li>
                <li>Segera akses aplikasi GeoSiaga untuk informasi terbaru</li>
                <li>Beritahu keluarga dan tetangga tentang informasi ini</li>
            </ul>
              <p>Untuk informasi lebih lanjut, silakan kunjungi aplikasi GeoSiaga atau hubungi nomor darurat setempat.</p>
            
            <p>Salam,<br><strong>Tim GeoSiaga</strong></p>
        </div>
        <div class="footer">
            <p><strong>Penting:</strong> Email ini adalah komunikasi resmi mengenai kebencanaan. Harap jangan mengabaikannya.</p>
            <p>Anda menerima email ini karena terdaftar sebagai pengguna aplikasi GeoSiaga.</p>
            <p>Untuk bantuan, silakan hubungi <a href="mailto:geosiaga@gmail.com">geosiaga@gmail.com</a></p>
            <p>© {{ date('Y') }} GeoSiaga - Sistem Informasi Tanggap Bencana</p>
        </div>
    </div>
</body>
</html>
