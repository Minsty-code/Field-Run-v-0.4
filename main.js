//====================
//Lancement
//====================

    document.addEventListener("DOMContentLoaded", () => {
        
        initMap();
        initMarker();
        initTrackingLine();

        startGPS();
        
        const Btnstart = document.getElementById('Btnstart');
        const Btnstop = document.getElementById('Btnstop');
    
        Btnstart.addEventListener("click", startTracking)
        Btnstop.addEventListener("click", stopTracking)
    
    });