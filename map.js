//====================
//Variables
//====================

//Carte
        let map;
//Marqueur
        let currentMarker;
//Cercle de précision
        let accuracyCircle;
//Ligne de suivi
        let line;

//====================
//Fonctions
//====================

    function initMap() {
        //CARTE        
//Crée une carte Leaflet avec ID "map"
//SetView([lat, lon], zoom)
        map = L.map('map').setView([0, 0], 13);

//Ajoute les tuiles (images de carte) depuis OpenStreetMap
// {z}/{x}/{y} = système de coordonnées des tuiles
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' //obligation légale
        }).addTo(map);
    }

    function initMarker() {
        //MARQUEUR
//Crée un marqeur au point [0,0] au départ (déplacé plus tard avec le GPS)
        currentMarker = L.marker([0,0]).addTo(map)
        .bindPopup('Tu es là')  //texte affiché si on clique
        .openPopup();           //ouvre le popup automatiquement
    }

    function initTrackingLine() {
        line = L.polyline([], {
            color: "#2800A8",
            fillOpacity: 1,
            weight: 5,
        }).addTo(map);
    }

    function updateMarker(lat, lon) {
        //Déplace le marqueur vers la nouvelle position
        currentMarker.setLatLng([lat, lon]);
    }

    function updateAccuracyCircle(lat, lon, accuracy) {
        if (accuracyCircle) {

//Si le cercle existe déja, on le déplace
            accuracyCircle
                .setLatLng([lat, lon])
                .setRadius(accuracy);

//Sinon on le crée
        } else{
            accuracyCircle = L.circle([lat, lon], {
                radius: accuracy,
                color: accuracy > 100 ? 'red' : 'blue',
                fillOpacity: 0.09
            }).addTo(map);
        }
    }

    function updateLine(coords) {
        line.setLatLngs(coords);
    }