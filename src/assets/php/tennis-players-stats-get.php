<?php

    $servername="localhost";
    $username = "w8ing4d2_w8stats";
    $password = "2021#W8Stats";
    $dbname = "w8ing4d2_w8stats";
    $tabname = "TennisPlayersStats";
    $dsn="mysql:host=$servername;dbname=$dbname";

    try {
        $connect=new PDO ($dsn,$username,$password);
        $connect->exec("SET NAMES 'utf8';");
    } catch(PDOException $error) {
        echo "Error in connect".$error->getMessage();
        exit();
    }

    if (isset($_GET["Id"])) {
        $id = $_GET['Id'];
        $sql = "SELECT * FROM $tabname WHERE Id = $id";
        $result = $connect->query($sql);
        $output = array();
        while ( $row=$result->fetch(PDO::FETCH_ASSOC) ) {
            $output[] = $row;
        }
        echo json_encode($output);
    } else {
        echo "Error no Id".$error->getMessage();
        exit();
    }

?>
