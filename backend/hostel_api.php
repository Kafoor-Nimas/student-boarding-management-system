<?php
require_once 'config/db.php';
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET (Single or All) - No changes needed here
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

// 2. POST (Insert with Image)
// --- Combined POST Logic (Handles both Insert and Update) ---
if ($method === 'POST') {
    // Collect data from $_POST (since we are using FormData)
    $title = mysqli_real_escape_string($conn, $_POST['listing_title']);
    $uni = mysqli_real_escape_string($conn, $_POST['university']);
    $loc = mysqli_real_escape_string($conn, $_POST['location']);
    $dist = mysqli_real_escape_string($conn, $_POST['distance']);
    $price = mysqli_real_escape_string($conn, $_POST['monthly_price']);
    $type = mysqli_real_escape_string($conn, $_POST['room_type']);
    $gen = mysqli_real_escape_string($conn, $_POST['gender']);
    $desc = mysqli_real_escape_string($conn, $_POST['description']);
    
    // Check if an ID was sent. If yes, we are UPDATING.
    $id = isset($_POST['id']) ? mysqli_real_escape_string($conn, $_POST['id']) : null;

    // Handle File Upload logic
    $image_sql = "";
    if (isset($_FILES['hostel_image']) && $_FILES['hostel_image']['error'] === 0) {
        $target_dir = "../assets/images/uploads/";
        $file_ext = pathinfo($_FILES["hostel_image"]["name"], PATHINFO_EXTENSION);
        $image_name = time() . "_" . uniqid() . "." . $file_ext; 
        
        if (move_uploaded_file($_FILES["hostel_image"]["tmp_name"], $target_dir . $image_name)) {
            // If we are updating and a new image is uploaded, we update the image_name column too
            $image_sql = ", image_name='$image_name'";
        }
    }

    if ($id) {
        // --- UPDATE EXISTING RECORD ---
        $sql = "UPDATE hostel_listings SET 
                listing_title='$title', university='$uni', location='$loc', 
                distance='$dist', monthly_price='$price', room_type='$type', 
                gender='$gen', description='$desc' $image_sql 
                WHERE id = $id";
    } else {
        // --- INSERT NEW RECORD ---
        // Use default image if none uploaded for new listing
        $final_image = isset($image_name) ? $image_name : 'default.jpg';
        $sql = "INSERT INTO hostel_listings (listing_title, university, location, distance, monthly_price, room_type, gender, description, image_name) 
                VALUES ('$title', '$uni', '$loc', '$dist', '$price', '$type', '$gen', '$desc', '$final_image')";
    }
    
    echo json_encode(mysqli_query($conn, $sql) ? ["status" => "success"] : ["status" => "error", "error" => mysqli_error($conn)]);
}

// 3. PUT (Update) - Note: PHP has a quirk with PUT and Files. 
// For simplicity, many developers use POST with an "id" to update when files are involved.
// If you use PUT, you must read raw input differently. Here is the standard Update:
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = mysqli_real_escape_string($conn, $data['id']);
    
    $sql = "UPDATE hostel_listings SET 
            listing_title='{$data['listing_title']}', university='{$data['university']}', location='{$data['location']}', 
            distance='{$data['distance']}', monthly_price='{$data['monthly_price']}', room_type='{$data['room_type']}', 
            gender='{$data['gender']}', description='{$data['description']}' 
            WHERE id = $id";
            
    echo json_encode(mysqli_query($conn, $sql) ? ["status" => "success"] : ["status" => "error"]);
}

// 4. DELETE - No changes needed

if ($method === 'DELETE') {
    // Attempt 1: Read from JSON Body
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);
    
    // Attempt 2: Read from URL (if Attempt 1 fails)
    $id = null;
    if (isset($data['id'])) {
        $id = $data['id'];
    } elseif (isset($_GET['id'])) {
        $id = $_GET['id'];
    }

    if ($id) {
        $clean_id = mysqli_real_escape_string($conn, $id);
        $sql = "DELETE FROM hostel_listings WHERE id = '$clean_id'";
        
        if (mysqli_query($conn, $sql)) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "error" => mysqli_error($conn)]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No ID found in Body or URL", "received" => $json]);
    }
    exit;
}
?>