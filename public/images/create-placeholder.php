<?php
// Create a 300x300 image
$image = imagecreatetruecolor(300, 300);

// Define colors
$bg = imagecolorallocate($image, 230, 230, 230);
$text_color = imagecolorallocate($image, 120, 120, 120);

// Fill the background
imagefill($image, 0, 0, $bg);

// Add text
imagestring($image, 5, 60, 140, 'Gambar Tidak Tersedia', $text_color);

// Output to browser
header('Content-Type: image/png');
imagepng($image);
imagedestroy($image);
?>
