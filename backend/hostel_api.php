<?php
require_once 'config/db.php';
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

// 1. GET (Single or All)
if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $id = mysqli_real_escape_string($conn, $_GET['id']);
        $sql = "SELECT * FROM hostel_listings WHERE id = $id";
        $result = mysqli_query($conn, $sql);
        echo json_encode(mysqli_fetch_assoc($result));
    } else {
        $sql = "SELECT * FROM hostel_listings ORDER BY id DESC";
        $result = mysqli_query($conn, $sql);
        echo json_encode(mysqli_fetch_all($result, MYSQLI_ASSOC));
    }
}

// 2. POST (Insert)
if ($method === 'POST') {
    $sql = "INSERT INTO hostel_listings (listing_title, university, location, distance, monthly_price, room_type, gender, description) 
            VALUES ('{$data['listing_title']}', '{$data['university']}', '{$data['location']}', '{$data['distance']}', '{$data['monthly_price']}', '{$data['room_type']}', '{$data['gender']}', '{$data['description']}')";
    echo json_encode(mysqli_query($conn, $sql) ? ["status" => "success"] : ["status" => "error"]);
}

// 3. PUT (Update)
if ($method === 'PUT') {
    $sql = "UPDATE hostel_listings SET 
            listing_title='{$data['listing_title']}', university='{$data['university']}', location='{$data['location']}', 
            distance='{$data['distance']}', monthly_price='{$data['monthly_price']}', room_type='{$data['room_type']}', 
            gender='{$data['gender']}', description='{$data['description']}' 
            WHERE id = {$data['id']}";
    echo json_encode(mysqli_query($conn, $sql) ? ["status" => "success"] : ["status" => "error"]);
}

// 4. DELETE
if ($method === 'DELETE') {
    $sql = "DELETE FROM hostel_listings WHERE id = {$data['id']}";
    echo json_encode(mysqli_query($conn, $sql) ? ["status" => "success"] : ["status" => "error"]);
}
?>