//====================
//Variables
//====================

//Tableau d'historique de position
        let coords = [];
//En train de jouer ?
        let isRunning = false;
//Watch Position
        let watchId;
//Première initialisation
        let firstMapFix = true;
//Premier point GPS
        let firstPoint = null;
//Première initialisation tracage
        let firstTracingFix = true;

//====================
//Fonctions
//====================

    //Afficher le loader
    function showLoader(){
        document.documentElement.style.setProperty("--loader-visible", "1");
    }

    //Cacher le loader
    function hideLoader() {
        document.documentElement.style.setProperty("--loader-visible", "0");
    }

    //Démarre la récupération GPS
    function startGPS() {
        if ("geolocation" in navigator) {                              
//watchPosition = surveille la position en continu
            watchId = navigator.geolocation.watchPosition( //-----------------------------WATCH POSITION
                onPositionUpdate,
                handleError,
                
                { enableHighAccuracy: true, maximumAge: 0, timeout: 75000 }
            );
            
        } else {
                
                alert("GPS non disponible sur ce navigateur");
        }
    }

    //Arrête la récupération GPS
    function stopGPS() {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
    }


//Fonction appelée à chaque mise à jour GPS
    function onPositionUpdate(position) {

//Récupère les coordonnées
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
//Récupère la précision en mètres
        const accuracy = position.coords.accuracy;

        const currentPoint = [lat, lon];
        
        updateMarker(lat, lon);
        updateAccuracyCircle(lat, lon, accuracy);
        map.setView([lat, lon], 16);

        // Ignore les positions avec une précision trop faible
        if (accuracy > 30) {
            return;
        }
        
        // Si on est en train de tracer
        if (isRunning) {
            //Ignore les mouvements trop faibles pour éviter le "clignotement"
            if (coords.length > 0) {
                const lastPoint = coords[coords.length - 1];
                const moveDistance = distance(lastPoint, currentPoint);

                    if (moveDistance < 1) {
                        return;
                    }       
            }

            //Ajoute le point au tracé
            coords.push(currentPoint);
            updateLine(coords);

            //Définit le point de départ si c'est le premier point du tracé
            if (firstTracingFix) {
                firstPoint = currentPoint;
                firstTracingFix = false;
            }

            //Vérifie si on peut fermer la zone
            checkCloseZone(currentPoint);
        }
        
        if(map) {
            if (firstMapFix) {
                showLoader();
                map.setView([lat, lon], 16);// centre + zoom fort
                firstMapFix = false;
                hideLoader();
            } else {
                map.panTo([lat, lon]);       // déplacement doux
            }

        }

    }

//Fonction pour calculer la distance entre deux points GPS (en m)
    function distance(point1, point2) {
        const lat1 = point1[0];
        const lon1 = point1[1];
        const lat2 = point2[0];
        const lon2 = point2[1];

        const R = 6371000; //rayon de la Terre (m)

        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const formuleHaversine =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const angleCentral = 2 * Math.atan2(
            Math.sqrt(formuleHaversine),
            Math.sqrt(1 - formuleHaversine)
        );

        return R * angleCentral; //distance en mètres
    }

//Test d'intersection
    function checkIntersection(currentPoint) {
        if (coords.length < 4) {
            return null; //pas assez de segment pour croiser
        }
            const newSegmentStart = coords [coords.length - 1];
            const newSegmentEnd = currentPoint;

            for (let i = 0; i < coords.length - 3; i++) {
                
                const segStart = coords[i];
                const segEnd = coords[i+1];

                const intersection = segmentIntersection(
                    segStart, 
                    segEnd, 
                    newSegmentStart, 
                    newSegmentEnd
                );
                    
                if (intersection) {
                    return intersection;
                }
            }
        
            return null; //pas d'intersection
    }

//segments d'intersection
    function segmentIntersection(p1, p2, q1, q2) { // p1 & p2 : segment existant § q1 & q2 : nouveau segment
        //vecteurs et paramétrisation de la ligne
        const s1x = p2[0] - p1[0];
        const s1y = p2[1] - p1[1];
        const s2x = q2[0] - q1[0];
        const s2y = q2[1] - q1[1];

        const denom = (-s2x * s1y + s1x * s2y);

        // segments parallèles → pas d'intersection
        if (Math.abs(denom) < 0.0000001) {
            return null;
        }
        const s = (-s1y * (p1[0] - q1[0]) + s1x * (p1[1] - q1[1])) / denom;
        const t = ( s2x * (p1[1] - q1[1]) - s2y * (p1[0] - q1[0])) / denom;

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            //intersetion trouvée
            return [p1[0] + (t * s1x), p1[1] + (t * s1y)];
        }

        return null; //pas d'intersection
    }
//Fonction pour vérifier si on peut fermer la zone
    function checkCloseZone(currentPoint) {
        // Cas 1 : retour proche du point de départ
        if (firstPoint && distance(firstPoint, currentPoint) < 3 && coords.length > 5) {
            closeZone(coords);
            return;
        }
        //Cas 2 : intersection avec une ligne récédente
        const intersection = checkIntersection(currentPoint);
        if (intersection) {
            coords.push(intersection);
            closeZone(coords);
            return;
        }
    }

//Fonction pour fermer la zone et l'afficher
    function closeZone(points) {

        stopTracking();

        L.polygon(points, {
            color: "#2800A8",
            fillOpacity: 0.4,
        }).addTo(map);
    }

//Démarrer le suivi
    function startTracking() {
        isRunning = true;
        coords = []; 
        firstTracingFix = true;
        firstPoint = null;
    }

//Arrêter le suivi
    function stopTracking() {
        isRunning = false;
    }

//Gestion des erreurs GPS
     function handleError(error) {
        alert("GPS refusé ou indisponible");
    }