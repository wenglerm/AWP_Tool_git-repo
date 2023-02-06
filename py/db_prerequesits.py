db_config = {
    'user' : 'wenglerm',
    'database' : 'awp_tool_db'
}

MODELDATA_TABLE = (
    "CREATE TABLE `modeldata` ("
    " `Nummer` int(8) NOT NULL,"
    " `Kunde` varchar(30) NOT NULL,"
    " `LKW-Hersteller und Typ` varchar(30) NOT NULL,"
    " `VA leer` int(7) NOT NULL,"
    " `HA leer` int(7) NOT NULL,"
    " `Wiegeart` varchar(30) NOT NULL,"
    " `Vorderachse` int(7) NOT NULL,"
    " `Hinterachse` int(7) NOT NULL,"
    " `Linke Seite` int(7) NOT NULL,"
    " `Rechte Seite` int(7) NOT NULL,"
    " `Tankgröße` int(5) NOT NULL,"
    " `Tankinhalt` int(3) NOT NULL,"
    " `Radstand` float(15) NOT NULL,"
    " `VA-Gewicht (zulässig)` int(7) NOT NULL,"
    " `HA1-Gewicht (zulässig)` int(7) NOT NULL,"
    " `HA2-Gewicht (zulässig)` int(7) NOT NULL,"
    " `Fahrzeuggewicht (zulässig)` int(7) NOT NULL,"
    " `Aufsetzmaß` float(15) NOT NULL,"	
    " `Datum` date NOT NULL,"
    " PRIMARY KEY (`Nummer`)"
)
