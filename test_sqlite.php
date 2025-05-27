<?php
try {
    $db = new PDO('sqlite::memory:');
    echo "SQLite connection successful!";
    $db = null;
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
