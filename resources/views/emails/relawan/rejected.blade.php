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
    <title>Permohonan Relawan Tidak Disetujui</title>
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
            background-color: #6b7280;
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
        .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #6b7280;
            padding: 15px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #3b82f6;
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
            PERMOHONAN RELAWAN
        </div>
        <div class="content">
            <!-- Tambah text pra-header untuk meningkatkan deliverability -->
            <div style="display: none; max-height: 0px; overflow: hidden;">
                Informasi terkait permohonan relawan Anda pada aplikasi GeoSiaga.
            </div>
            
            <p>Halo <strong>{{ $name }}</strong>,</p>
            
            <div class="info-box">
                <h2>Permohonan Relawan Tidak Disetujui</h2>
                <p>Dengan berat hati kami informasikan bahwa permohonan Anda untuk menjadi relawan pada aplikasi GeoSiaga tidak dapat kami setujui saat ini.</p>
            </div>
            
            <p>Hal ini bisa disebabkan oleh beberapa faktor, seperti:</p>
            <ul>
                <li>Data atau dokumen yang kurang lengkap</li>
                <li>Tidak memenuhi kriteria yang diperlukan</li>
                <li>Kuota relawan untuk area Anda telah terpenuhi</li>
            </ul>
            
            <p>Anda tetap dapat mendaftar kembali di lain waktu dengan melengkapi persyaratan yang diperlukan.</p>
            
            <p>Terima kasih atas minat dan antusiasme Anda untuk bergabung sebagai relawan.</p>
            
            <p>Salam,<br><strong>Tim GeoSiaga</strong></p>
        </div>
        <div class="footer">
            <p>Email ini dikirim secara otomatis. Mohon tidak membalas email ini.</p>
            <p>Untuk bantuan, silakan hubungi <a href="mailto:geosiaga@gmail.com">geosiaga@gmail.com</a></p>
            <p>© {{ date('Y') }} GeoSiaga</p>
        </div>
    </div>
</body>
</html> 