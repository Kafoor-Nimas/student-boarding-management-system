<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE");

require_once 'config/db.php'; // Using your mysqli connection

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT * FROM hostel_listings ORDER BY created_at DESC";
    $result = mysqli_query($conn, $sql);
    $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
    echo json_encode($data);
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Mapping JS names to your specific DB columns from the screenshot
    $title = mysqli_real_escape_string($conn, $data['listing_title']);
    $uni = mysqli_real_escape_string($conn, $data['university']);
    $loc = mysqli_real_escape_string($conn, $data['location']);
    $dist = mysqli_real_escape_string($conn, $data['distance']);
    $price = mysqli_real_escape_string($conn, $data['monthly_price']);
    $type = mysqli_real_escape_string($conn, $data['room_type']);
    $gen = mysqli_real_escape_string($conn, $data['gender']);
    $desc = mysqli_real_escape_string($conn, $data['description']);

    $sql = "INSERT INTO hostel_listings (listing_title, university, location, distance, monthly_price, room_type, gender, description) 
            VALUES ('$title', '$uni', '$loc', '$dist', '$price', '$type', '$gen', '$desc')";

    if (mysqli_query($conn, $sql)) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    }
}

// ... after your POST block ...

if ($method === 'DELETE') {
    // Read the JSON data sent from JavaScript
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['id'])) {
        $id = mysqli_real_escape_string($conn, $data['id']);
        
        // Use your exact table name from the screenshot: hostel_listings
        $sql = "DELETE FROM hostel_listings WHERE id = $id";
        
        if (mysqli_query($conn, $sql)) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No ID provided"]);
    }
}
?>