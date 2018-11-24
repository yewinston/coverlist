var allPlaylists = {};

function newPlaylist(playlistName){
	var playlist = {};
	playlist.name = playlistName;

	// tracks contains all of the covers
	playlist.tracks = [];

	// orgTracks contains all of the original tracks
	playlist.orgTracks = [];

    // adds a track, if it's a new track, return true, if not, false
	playlist.addTrack = function(trackName, url, artist){
		
		// if the track already exists from before, add it
		if(playlist.orgTracks.includes(trackName)){
			var numTracks = playlist.tracks.length;

			// find the track and add the url to the list of urls
			for(var i = 0; i < numTracks; i++){
				if(playlist.tracks[i].name == trackName){
					// check if url already exists
					if(playlist.tracks[i].urls.includes(url)){
						console.log(playlist.tracks[i].name + " already contains url: " + url);
					}
					// add it if it isn't
					else{
						playlist.tracks[i].urls.push(url);
					}
				}
			}
            return false; // pre-existing
		}
		
		// otherwise create a new playlist for it
		else{

			var newTrack = {}; // create a new object for the track

			newTrack.name = trackName; // set the original name
            newTrack.artist = artist; // set the artist name
			newTrack.urls = [];	// create a new array to store all the urls

			newTrack.urls.push(url); // append the new url

			playlist.tracks.push(newTrack); // append the new object playlist to the track folder
			playlist.orgTracks.push(trackName); // append the name since it's new
            
            return true; // new track
		}
	};

	// removes a track if it exists
	playlist.removeTrack = function(trackName, url){
		var removed = false;
		
		// check if the track exists first
		if(playlist.orgTracks.includes(trackName)){
			var numTracks = playlist.tracks.length;

			// find the track and add the url to the list of urls
			for(var i = 0; i < numTracks; i++){
				if(playlist.tracks[i].name == trackName){
					var numCovers = playlist.tracks[i].urls.length;

					// find the url and delete it
					for(var j = 0; j < numCovers; j++){
						if(playlist.tracks[i].urls[j] == url){
							playlist.tracks[i].urls.splice(j, 1);

							// if there are no more covers, delete the entire track and from orgTrack
							if(playlist.tracks[i].urls.length == 0){
								var index = playlist.orgTracks.indexOf(trackName);
								playlist.orgTracks.splice(index, 1);
								playlist.tracks.splice(i, 1);
								console.log(trackName + " has been removed.");
							}
							removed = true;
							break;
						}
					}
					break; // both breaks efficiency
				}
			}
			// invalid url/unable to find url(shouldn't happen)
			if(removed == false){
				console.log("The URL " + url + " doesn't exist");
			}
		}
		
		// if it doesn't report to the user that track does not exist
		else{
			console.log("The track " + trackName + " doesn't exist");
		}
	}

	playlist.selectTrack = function(trackName, currentURL){
        
        var numTotalTracks = playlist.tracks.length;

		for(var i = 0; i < numTotalTracks; i++){
			if(playlist.tracks[i].name == trackName){
				var randomTrack = getRandomInt(playlist.tracks[i].urls.length);
                
                var numTracks = playlist.tracks[i].urls.length;

				if(numTracks > 1){
					// keep generating a new track if it's the current one playing
					while(playlist.tracks[i].urls[randomTrack] == currentURL){
						randomTrack = getRandomInt(playlist.tracks[i].urls.length);
					}
					console.log("Next URL: " + playlist.tracks[i].urls[randomTrack])
				}
                
                console.log("Current track: " + playlist.tracks[i].name);
				return playlist.tracks[i].urls[randomTrack];
			}
		}
        return "" // error
	}
    
    // add artist and duration counts checking later
    // gets cover counts
    playlist.getCounts = function(trackName, artist){
        if(playlist.orgTracks.includes(trackName)){
            var numTracks = playlist.tracks.length;
            
            for(var i = 0; i < numTracks; i++){
				if((playlist.tracks[i].name == trackName)&&(playlist.tracks[i].artist == artist)){
					return playlist.tracks[i].urls.length; // returns length
				}
			}
            return -1 // error
        }
    }
	return playlist;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}