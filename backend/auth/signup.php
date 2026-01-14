<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include("../config/db.php");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo "invalid request";
    exit;
}

// Collect data safely
$full_name  = mysqli_real_escape_string($conn, $_POST['fullName'] ?? '');
$email      = mysqli_real_escape_string($conn, $_POST['emailAddress'] ?? '');
$password   = $_POST['password'] ?? '';
$phone_no   = mysqli_real_escape_string($conn, $_POST['phoneNo'] ?? '');
$role       = mysqli_real_escape_string($conn, $_POST['userType'] ?? '');
$university = mysqli_real_escape_string($conn, $_POST['university'] ?? '');

// Basic validation
if (!$full_name || !$email || !$password || !$phone_no || !$role) {
    echo "Missing required fields";
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Check email exists
$check = "SELECT id FROM users WHERE email='$email'";
$result = mysqli_query($conn, $check);

if (mysqli_num_rows($result) > 0) {
    echo "Email already registered";
    exit;
}

// Insert user
$sql = "INSERT INTO users (full_name, email, password, phone_no, university, role)
        VALUES ('$full_name', '$email', '$hashedPassword', '$phone_no', '$university', '$role')";

if (mysqli_query($conn, $sql)) {
    echo "success";
} else {
    echo "Database error: " . mysqli_error($conn);
}
?>
