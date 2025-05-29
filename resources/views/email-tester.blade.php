<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Testing Tool - Si-Tanggap</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            padding: 20px;
        }
        .card {
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .card-header {
            background-color: #dc2626;
            color: white;
            font-weight: bold;
            border-radius: 10px 10px 0 0 !important;
        }
        .btn-primary {
            background-color: #dc2626;
            border-color: #dc2626;
        }
        .btn-primary:hover {
            background-color: #b91c1c;
            border-color: #b91c1c;
        }
        .result-box {
            max-height: 300px;
            overflow-y: auto;
            background: #f8f9fa;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="text-center my-4">Si-Tanggap Email Testing Tool</h1>
        
        <div class="row">
            <!-- Single Email Test -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        Uji Kirim Email Tunggal
                    </div>
                    <div class="card-body">
                        <form id="singleEmailForm">
                            <div class="mb-3">
                                <label for="email" class="form-label">Alamat Email</label>
                                <input type="email" class="form-control" id="email" name="email" required placeholder="email@example.com">
                            </div>
                            <button type="submit" class="btn btn-primary">Kirim Email Test</button>
                        </form>
                        <div class="mt-3 result-box" id="singleEmailResult" style="display: none;">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status" id="singleLoader">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                            <div id="singleEmailResultContent"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Role-based Email Test -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        Uji Kirim Email Berdasarkan Role
                    </div>
                    <div class="card-body">
                        <form id="roleEmailForm">
                            <div class="mb-3">
                                <label for="role" class="form-label">Pilih Role</label>
                                <select class="form-select" id="role" name="role" required>
                                    <option value="all">Semua Role</option>
                                    <option value="masyarakat">Masyarakat</option>
                                    <option value="relawan">Relawan</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">Kirim Email Test ke Role</button>
                        </form>
                        <div class="mt-3 result-box" id="roleEmailResult" style="display: none;">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status" id="roleLoader">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                            <div id="roleEmailResultContent"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SMTP Check -->
        <div class="row mt-3">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        Periksa Koneksi SMTP
                    </div>
                    <div class="card-body">
                        <button id="checkSmtp" class="btn btn-primary">Periksa Koneksi SMTP</button>
                        <div class="mt-3 result-box" id="smtpResult" style="display: none;">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status" id="smtpLoader">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                            <div id="smtpResultContent"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Email Configuration -->
        <div class="row mt-3">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        Konfigurasi Email Saat Ini
                    </div>
                    <div class="card-body">
                        <button id="debugEmail" class="btn btn-primary">Periksa Konfigurasi Email</button>
                        <div class="mt-3 result-box" id="debugResult" style="display: none;">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status" id="debugLoader">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                            <div id="debugResultContent"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('singleEmailForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const resultBox = document.getElementById('singleEmailResult');
            const resultContent = document.getElementById('singleEmailResultContent');
            const loader = document.getElementById('singleLoader');
            
            resultBox.style.display = 'block';
            resultContent.innerHTML = '';
            loader.style.display = 'block';
            
            fetch(`/send-test-email?email=${email}`)
                .then(response => response.json())
                .then(data => {
                    loader.style.display = 'none';
                    if (data.success) {
                        resultContent.innerHTML = `<div class="alert alert-success">
                            <strong>Berhasil!</strong> ${data.message}
                        </div>`;
                    } else {
                        resultContent.innerHTML = `<div class="alert alert-danger">
                            <strong>Gagal!</strong> ${data.message}
                            ${data.trace ? '<pre>' + data.trace + '</pre>' : ''}
                        </div>`;
                    }
                })
                .catch(error => {
                    loader.style.display = 'none';
                    resultContent.innerHTML = `<div class="alert alert-danger">
                        <strong>Error!</strong> Terjadi kesalahan saat menghubungi server.
                    </div>`;
                    console.error('Error:', error);
                });
        });

        document.getElementById('roleEmailForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const role = document.getElementById('role').value;
            const resultBox = document.getElementById('roleEmailResult');
            const resultContent = document.getElementById('roleEmailResultContent');
            const loader = document.getElementById('roleLoader');
            
            resultBox.style.display = 'block';
            resultContent.innerHTML = '';
            loader.style.display = 'block';
            
            fetch(`/test-email-by-role?role=${role}`)
                .then(response => response.json())
                .then(data => {
                    loader.style.display = 'none';
                    if (data.success) {
                        resultContent.innerHTML = `<div class="alert alert-success">
                            <strong>Berhasil!</strong> ${data.message}<br>
                            Total pengguna: ${data.total_users}<br>
                            Berhasil: ${data.success_count}<br>
                            Gagal: ${data.failed_count}
                        </div>`;
                    } else {
                        resultContent.innerHTML = `<div class="alert alert-danger">
                            <strong>Gagal!</strong> ${data.message}
                        </div>`;
                    }
                })
                .catch(error => {
                    loader.style.display = 'none';
                    resultContent.innerHTML = `<div class="alert alert-danger">
                        <strong>Error!</strong> Terjadi kesalahan saat menghubungi server.
                    </div>`;
                    console.error('Error:', error);
                });
        });

        document.getElementById('checkSmtp').addEventListener('click', function() {
            const resultBox = document.getElementById('smtpResult');
            const resultContent = document.getElementById('smtpResultContent');
            const loader = document.getElementById('smtpLoader');
            
            resultBox.style.display = 'block';
            resultContent.innerHTML = '';
            loader.style.display = 'block';
            
            fetch('/check-smtp')
                .then(response => response.json())
                .then(data => {
                    loader.style.display = 'none';
                    if (data.success) {
                        resultContent.innerHTML = `<div class="alert alert-success">
                            <strong>Berhasil!</strong> ${data.message}
                        </div>`;
                    } else {
                        resultContent.innerHTML = `<div class="alert alert-danger">
                            <strong>Gagal!</strong> ${data.message}
                        </div>`;
                    }
                })
                .catch(error => {
                    loader.style.display = 'none';
                    resultContent.innerHTML = `<div class="alert alert-danger">
                        <strong>Error!</strong> Terjadi kesalahan saat menghubungi server.
                    </div>`;
                    console.error('Error:', error);
                });
        });

        document.getElementById('debugEmail').addEventListener('click', function() {
            const resultBox = document.getElementById('debugResult');
            const resultContent = document.getElementById('debugResultContent');
            const loader = document.getElementById('debugLoader');
            
            resultBox.style.display = 'block';
            resultContent.innerHTML = '';
            loader.style.display = 'block';
            
            fetch('/debug-email')
                .then(response => response.json())
                .then(data => {
                    loader.style.display = 'none';
                    if (data.success) {
                        resultContent.innerHTML = `<div class="alert alert-success">
                            <strong>Berhasil!</strong> ${data.message}
                        </div>
                        <h5>Konfigurasi Email:</h5>
                        <pre>${JSON.stringify(data.mail_config, null, 2)}</pre>
                        <h5>Queue Connection:</h5>
                        <pre>${data.queue_connection}</pre>`;
                    } else {
                        resultContent.innerHTML = `<div class="alert alert-danger">
                            <strong>Gagal!</strong> ${data.message}
                        </div>
                        <h5>Konfigurasi Email:</h5>
                        <pre>${JSON.stringify(data.mail_config, null, 2)}</pre>
                        <h5>Queue Connection:</h5>
                        <pre>${data.queue_connection}</pre>
                        ${data.trace ? '<h5>Error Details:</h5><pre>' + data.trace + '</pre>' : ''}`;
                    }
                })
                .catch(error => {
                    loader.style.display = 'none';
                    resultContent.innerHTML = `<div class="alert alert-danger">
                        <strong>Error!</strong> Terjadi kesalahan saat menghubungi server.
                    </div>`;
                    console.error('Error:', error);
                });
        });
    </script>
</body>
</html>
