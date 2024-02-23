<?php

    header("Access-Control-Allow-Origin: *");

    $postdata = file_get_contents('php://input');
    $player = json_decode($postdata);

    $player_id = $player->id;
    $player_stats = $player->stats;

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

    $sql = "UPDATE $tabname SET PlayerStats='$player_stats' WHERE Id='$player_id'";
    $result = $connect->query($sql);

?>
