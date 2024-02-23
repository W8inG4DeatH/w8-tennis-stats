<?php

    $servername="localhost";
    $username = "w8ing4d2_w8stats";
    $password = "2021#W8Stats";
    $dbname = "w8ing4d2_w8stats";
    $tabname = "TennisPlayers";
    $dsn="mysql:host=$servername;dbname=$dbname";

    try {
        $connect=new PDO ($dsn,$username,$password);
        $connect->exec("SET NAMES 'utf8';");
    } catch(PDOException $error) {
        echo "Error in connect".$error->getMessage();
        exit();
    }

    $sql = "SELECT * from $tabname";
    $result = $connect->query($sql);

    $output = array();

    while ($row=$result->fetch(PDO::FETCH_ASSOC)) {
        $output[] = $row;
    }

    echo json_encode($output);

?>
