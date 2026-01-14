<?php
session_start();
header('Content-Type: text/plain'); // So frontend gets plain text

// Include your DB connection
require_once '../config/db.php'; // adjust path if needed

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo "Invalid request method";
    exit;
}

// Get POST data safely
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$userType = isset($_POST['userType']) ? trim($_POST['userType']) : '';

// Basic validation
if (empty($email) || empty($password) || empty($userType)) {
    echo "Please fill in all required fields";
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "Invalid email address";
    exit;
}

// Prepare SQL (safe from SQL injection)
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND role = ? LIMIT 1");
$stmt->bind_param("ss", $email, $userType);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Verify password
    if (password_verify($password, $user['password'])) {
        // Optional: save session data
        $_SESSION['stuNestUser'] = [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ];

        echo "success";
        exit;
    } else {
        echo "Incorrect password";
        exit;
    }

} else {
    echo "User not found with this role";
    exit;
}

?>
