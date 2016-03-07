<?php
/**
 * Created by PhpStorm.
 * User: johnuiterwyk
 * Date: 3/7/16
 * Time: 5:35 PM
 */

function getcsv($filename, $delimiter = ",", $enclosure = '"', $escape = "\\")
{
    $csvData = file_get_contents($filename);
    $lines = explode(PHP_EOL, $csvData);
    $array = array();
    foreach ($lines as $line) {
        $array[] = str_getcsv($line);
    }
    return $array;

}

$cities = getcsv('csv/100k-city-timezones.csv');
$countries = getcsv('csv/country.csv');

$countryMap = [];
$resultMap = [];
$resultArray = [];
foreach ($countries as $country)
{
    $countryMap[strtolower($country[0])] = $country[1];
}
foreach ($cities as $city)
{
    $key = $city[0].", ".$countryMap[strtolower($city[1])];
    $value = $city[2];
    $resultMap[$key] = stripcslashes($value);
    $resultArray[]= [$key,$value];
}

$jsonString =  json_encode($resultMap,JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
$fp = fopen('json/city-timezone.json', 'w');
fwrite($fp, $jsonString);
fclose($fp);

$jsonString =  json_encode($resultArray,JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
$fp = fopen('json/city-timezone-array.json', 'w');
fwrite($fp, $jsonString);
fclose($fp);
