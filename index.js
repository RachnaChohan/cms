var Hapi = require('hapi');

// Input[] should be Flickr's photo details including server, secret, farm
// Output[] is the full JPG web address
var createJpgPath = function (photos) {
    var i,
            photo,
            output = [],
            len = photos.length;
    for (i = 0; i < len; i++) {
        photo = photos[i];
//        if(i == 0){
////            console.log("Line 13"); // CLI
////            console.log(photo);        
        // https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
        output.push({
            "photoSrc": "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + ".jpg",
            "lat": photo.latitude,
            "lon": photo.longitude
        });
    }
    return output;
};

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

// Add the routes

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            listing: true
        }
    }
});

server.route({
    method: 'GET',
    path: '/flickr',
    handler: function (request, reply) {
        var credentials = require('./public/js/credentials.js'), // <script src="public/js/credentials.js"></script>
                httpRequest = require('request'),
                data = {
                    "method": 'flickr.photos.search',
                    "api_key": credentials.flickr.api_key,
                    "format": 'json',
                    "nojsoncallback": 1
                },
        options = {
            "uri": 'https://api.flickr.com/services/rest/',
            "qs": data
        };

        var flickrTag,
                flickrTags = ["tags", "lat", "lon", "arrays", "has_geo", "extras"];

        for (var i = 0, len = flickrTags.length; i < len; i++) {
            flickTag = flickrTags[i];
            if (request.query && request.query[flickTag]) {
                options.qs[flickTag] = request.query[flickTag];
            }
        }
        ;

//            if(request.query && request.query.tags){ 
//                options.qs.tags = request.query.tags;
//            }
//            
//            if(request.query && request.query.lat){
//                options.qs.lat = request.query.lat;
//            }
//            
//            if(request.query && request.query.lon){ 
//                options.qs.lon = request.query.lon;
//            }
//            
//            if(request.query && request.query.radius){ 
//                options.qs.raduis = request.query.radius;
//            }
//            
//            if(request.query && request.query.has_geo){ 
//                options.qs.has_geo = request.has_geo;
//            }
//            
//            if(request.query && request.query.extras){ 
//                options.qs.extras = request.extras;
//            }

        httpRequest(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
//                console.log('flickr content coming soon') // CLI
                var output = {
                    "photos": createJpgPath(JSON.parse(body).photos.photo)
                };
                reply(output); // Show the HTML for the Google homepage in Browser output
            }
        })
    }
});

server.route({
    method: 'GET',
    path: '/google',
    handler: function (request, reply) {
        var httpRequest = require('request');

        httpRequest('http://www.google.com', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('CLI')
                reply(body); // Show the HTML for the Google homepage in Browser output
            }
        })
    }
});

server.route({
    method: 'GET',
    path: '/twitter',
    handler: function (request, reply) {
//        reply({"key": 'twitter JSON output coming soon'});

        var Twit = require('twit'),
                secrets = require("./src/js/secretSrc.js")

        var T = new Twit(secrets.twitter);
//        T.post('statuses/update', {status: 'hello world!'}, function (err, data, response) {
//            console.log(data)
//        })
          T.get('statuses/user_timeline',{screen_name: 'vanarts'}, function (err, data, response){
              reply({"tweets":data})
          })
    }
});


server.route({
    method: 'GET',
    path: '/hello',
    handler: function (request, reply) {
        reply('hello world');
    }
});

// Start the server
server.start(function () {
    console.log('Server running at:', server.info.uri);
});