<?php

// Maximum file size
$maxsize = 10240; //Kb

// Supporting image file types
$types = Array('image/png', 'image/gif', 'image/jpeg');

$headers = getallheaders();

// LOG
$log = '=== ' . @date('Y-m-d H:i:s') . ' ===============================' . "\n"
        . 'HEADERS:' . print_r($headers, 1) . "\n";
$fp = fopen('log.txt', 'a');
fwrite($fp, $log);
fclose($fp);

// Result object
$r = new stdClass();
// Result content type
header('content-type: application/json');

// File size control
if ($headers['x-file-size'] > ($maxsize * 1024)) {
    $r->error = "Max file size: $maxsize Kb";
}

$folder = $headers['x-param-folder'] ? $headers['x-param-folder'] . '/' : '';
if ($folder && !is_dir($folder)) {
    mkdir($folder);
}


// File type control
if (in_array($headers['x-file-type'], $types)) {

    $filename = $folder . $headers['x-file-name'];

    // Uploaded file source
    $source = file_get_contents('php://input');

    $image = imagecreatefromstring($source);
    image_save($source, $filename);

} else {
    $r->error = "Unsupported file type: " . $headers['x-file-type'];
}


// File path
$path = str_replace('upload.php', '', $_SERVER['SCRIPT_NAME']);


// Image tag
$r->filename = $filename;
$r->path = $path;
$r->img = '<img src="' . $path . $filename . '" alt="image" />';
echo json_encode($r);


// utility

function image_save($source, $destination) {

    $image = imagecreatefromstring($source);

    if ($image) {

        $dext = strtolower(pathinfo($destination, PATHINFO_EXTENSION));
        if ($dext == '') {
            $dext = $ext;
            $destination .= '.' . $ext;
        }

        switch ($dext) {
            case 'jpeg':
            case 'jpg':
                imagejpeg($image, $destination);
                break;
            case 'png':
                imagepng($image, $destination);
                break;
            case 'gif':
                imagegif($image, $destination);
                break;
        }
        @imagedestroy($image);
    }
}
