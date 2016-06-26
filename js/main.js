// "use strict";

var MapViewModel = function() {
    var self = this;
    var map;

    self.markers = ko.observableArray([]);
    self.currentFilter = ko.observable();
    init = function() {

        var mapOptions = {
            disableDefaultUI: true
        };
        map = new google.maps.Map(document.getElementById('map'), mapOptions);

        var getData = function() {
            var foursquare = 'https://api.foursquare.com/v2/venues/search?client_id=MARBJEYCRUCGBFI5ZL52W15MCWCRLSHJOL5VA2QUR5RGTU4N&client_secret=4DRMMJLWCHMHZ01QY2GGNCAKSCLMYPHDGMTNGLN3FXD1I40X&v=20160601&ll=37.4,-121.9&query=hotel&limit=5';
            $.getJSON(foursquare)
                .done(function (data) {
                    // Sets the boundaries of the map based on pin locations
                    window.mapBounds = new google.maps.LatLngBounds();

                    // pinPoster(locations) creates pins on the map for each location in
                    // the locations array
                    pinPoster(data.response.venues);
                })
                .fail(function (err) {
                    alert("Request Failed");

                });
        };



        var update = function(data, markerToUpdate) {
            var contentString = '<div><h1>'+ data.name + '</h1><p>' + data.location.address  + '</p></div>';
            self.infowindow = new google.maps.InfoWindow();
            google.maps.event.addListener(markerToUpdate, 'click', function() {
                self.infowindow.setContent(contentString);
                self.infowindow.open(self.map, this);
                map.panTo(markerToUpdate.position);
            });
        };

        var createMapMarker = function(placeData) {
            // The next lines save location data from the search result object to local variables
            var lat = placeData.location.lat;  // latitude from the place service
            var lon = placeData.location.lng;  // longitude from the place service
            var name = placeData.name;   // name of the place from the place service
            var bounds = window.mapBounds;            // current boundaries of the map window

            // marker is an object with additional data about the pin for a single location
            var marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(lat, lon),
                name: name,
                animation: google.maps.Animation.DROP,
            });
            update(placeData,marker);
            self.markers.push(marker);
            // infoWindows are the little helper windows that open when you click
            // or hover over a pin on a map. They usually contain more information
            // about a location.
            // this is where the pin actually gets added to the map.
            // bounds.extend() takes in a map location object
            bounds.extend(new google.maps.LatLng(lat, lon));
            // fit the map to the new marker
            map.fitBounds(bounds);
            // center the map
            map.setCenter(bounds.getCenter());
        };
          /*
          pinPoster(locations) takes in the array of locations created by locationFinder()
          and fires off Google place searches for each location
          */
        var pinPoster = function(locations) {
            // Iterates through the array of locations, creates a search object for each location
            locations.forEach(function(place){
                createMapMarker(place);
            });
        };
        getData();
    };

    // Calls the init() function when the page loads
    //window.addEventListener('load', init);

    // Vanilla JS way to listen for resizing of the window
    // and adjust map bounds
    window.addEventListener('resize', function(e) {
      //Make sure the map bounds get updated on page resize
        map.fitBounds(mapBounds);
    });
    var stringFilter = function (string, filter) {
        string = string || "";
        if (filter.length > string.length)
            return false;
        return !(string.indexOf(filter) === -1);
    };
    self.filterMmarkers = ko.computed(function () {

        if (!self.currentFilter()) {
            self.markers().forEach(function(marker) {
                marker.setMap(map);
            });
            return self.markers();
        } else {
            var filter = self.currentFilter().toLowerCase();

            return ko.utils.arrayFilter(self.markers(), function (marker) {
                if (stringFilter(marker.name.toLowerCase(), filter)) {
                    marker.setMap(map);
                } else {
                    marker.setMap(null);
                }
                return stringFilter(marker.name.toLowerCase(), filter);
            });
        }
    });

    self.setCurrent = function(marker) {
        google.maps.event.trigger(marker, 'click');
    };

};
function googleError() {
    alert('Failed to load google maps');
    // and this will be called when there was an error
}


$(function(){
    ko.applyBindings(new MapViewModel());
});