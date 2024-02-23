<?php

    header("Access-Control-Allow-Origin: *");
	$player_stats = file_get_contents('php://input');

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

    $sql = "INSERT INTO $tabname(PlayerStats)VALUES('$player_stats')";
    $result = $connect->query($sql);

?>
