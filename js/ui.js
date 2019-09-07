// playlist UI
var currPlaylistT = $("#tracks-table");
var htmlPlaylistT = document.getElementById("tracks-table");

// volume ui
var volumeUI = document.getElementById("volumeRocker");
var volumeVisible = false;

// colour ui
var themeUI = document.getElementById("themeUI");
var themeVisible = false;

// temp: multiple playlists not implemented
var currPlaylist = newPlaylist("playlist1");
var currentID = "";
var currentNum = 0;

function addCover(trackName, trackArtist, trackURL){

    // ONLY IF USER ISN'T LOADING PLAYLIST, THEN USE THE VALUES IN FIELDS
    if((trackName === undefined)&&(trackURL === undefined)&&(trackArtist === undefined)){
        var trackName = $("input[name='title']").val();
        var trackURL = $("input[name='trackurl']").val();
        var trackArtist = $("input[name='artist']").val();
    
        trackURL = parseURL(trackURL);
    }
    
    if((trackName == "")||(trackURL == false)){
        if(trackURL == false){
            alert("Error: url must be a valid YouTube link.")
        }
        else{
            alert("Error: missing a track name.")
        }
        return;
    }
    
    if(trackArtist == ""){
        trackArtist = "Unknown";
    }
    
    // add the track, if it doesn't exist then add new row
    if(currPlaylist.addTrack(trackName, trackURL, trackArtist) == true){

    	var trackIndex = currPlaylist.orgTracks.indexOf(trackName)+1;
        
        currPlaylistT.append($('<tr>')
            .append($('<td>')
                .text(trackIndex) // index of the track within the playlist
                )

            .append($('<td>')
                .text(trackName) // track name
                )

            .append($('<td>')
                .text(trackArtist) // artist name
                )

            .append($('<td>')
                .text("1") // covers
                )

            .append($('<td>')
                .text("-") // duration
                )
            );

        // this is being called twice for some reason, and this workaround isn't that great...
        // remove .unbind('click') to solve this later
        // https://stackoverflow.com/questions/3070400/jquery-button-click-event-is-triggered-twice
        $("#tracks-table tr").unbind('click').bind('click', function(){
            var trackName = $(this).children("td")[1].textContent;
            var trackNum = $(this).children("td")[0].textContent;
            changePlayer(trackName, trackNum);
        });

        changePlayer(trackName, trackIndex); // give the user immediate feedback, play the video
    }
    
    // add to covers 
    else{
        for(var i = 1, row; row = htmlPlaylistT.rows[i]; i++){
            var checkName = htmlPlaylistT.rows[i].cells[1].textContent;
            var checkArtist = htmlPlaylistT.rows[i].cells[2].textContent;

            if ((checkName == trackName)&&(checkArtist == trackArtist)){
                row.cells[3].innerHTML = currPlaylist.getCounts(trackName, trackArtist);
            }
        }
    }
}

function savePlaylist(){
    var savedPlaylist = JSON.stringify(currPlaylist);
    var blob = new Blob([savedPlaylist], {
        type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "playlist.txt");
    console.log('Playlist saved.');
}

// TODO: multi-loading -> shouldn't use playlist1 as name.
function loadPlaylist(playlistStr){
    var tempPlaylist;

    if(playlistStr == 'select'){
    	var playlistStr = allPlaylists[1];	
    }
    else if(playlistStr == 'empty'){
    	var playlistStr = allPlaylists[0];
    }

    else if(playlistStr == null){
    	playlistStr = prompt("Please enter your playlist.txt contents below.");
    }

    if((playlistStr == null)||(playlistStr == "")){
        alert("Error. Contents are invalid. Please check playlist.txt. If problem persists, please submit issue on GitHub.");
        return;
    }
    else{
        tempPlaylist = JSON.parse(playlistStr); // to get all songs etc, temp
    }

    currPlaylist = newPlaylist("playlist1"); // new playlist

    // clear the playlist table first

    var numRows = htmlPlaylistT.rows.length;
    var rows = 1;

    while(rows < numRows){
        htmlPlaylistT.deleteRow(1); // this will remove very single row except the header
        rows++;
    }

    // restart current track number to be 0 (start of playlist)
    currentNum = 0;

    console.log("Loading: " + playlistStr)

    // add all the tracks from playlist into table
    for(var i = 0; i < tempPlaylist.orgTracks.length; i++){
        // iterate through all URL's and add them to playlist
        for(var j = 0; j < tempPlaylist.tracks[i].urls.length; j++){
            // using addCover(name, artist, url)
            addCover(tempPlaylist.tracks[i].name, tempPlaylist.tracks[i].artist, tempPlaylist.tracks[i].urls[j]);
            console.log("Adding " + tempPlaylist.tracks[i].urls[j] + " to " + tempPlaylist.tracks[i].name);

            // take the first track within playlist and load it within player
            if((i == 0)&&(j == 0)){
            	currentID = tempPlaylist.tracks[i].urls[j];
            	player.loadVideoById(currentID);
            }
        }
    }

    console.log("Load complete.")
}

function changePlayer(trackName, trackNum){
    currentID = currPlaylist.selectTrack(trackName, currentID);
    currentNum = parseInt(trackNum);
	if(currentID != ""){
	   player.loadVideoById(currentID);
    }
}

// credits to Lasnv from https://stackoverflow.com/a/8260383
function parseURL(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

// YOUTUBE PLAYER
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//    This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
	  height: '184',
	  width: '325',
	  videoId: '',
	  playerVars: { 'autoplay': 1, 'controls':0, 'rel': 0 },
	  events: {
	    'onReady': onPlayerReady,
        'onStateChange': onStateChange
	  }
	});

    // state info: https://developers.google.com/youtube/iframe_api_reference?csw=1#Playback_status
    $("#pausePlayer").click(function(){
        var state = player.getPlayerState();
        if(state == 1){
            player.pauseVideo();
            this.name = "play";
        }
        else if(state == 2){
            player.playVideo();
            this.name = "pause";
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function onStateChange(event){

    // Change the text every state change
    $("#videoName").text(player.getVideoData().title);
    
    // Plays next track after song is over
    if(event.data === 0){
        console.log("Video has ended, playing next track.")
        var tableRows = $("#tracks-table tr");
        
        if(currentNum >= currPlaylist.tracks.length){
            var nextTrackName = tableRows[1].cells[1].textContent;
            console.log("Repeating playlist...");
            console.log("Next track is: " + nextTrackName);

            changePlayer(nextTrackName, 1);
        }
        else{
            var nextTrackName = tableRows[currentNum+1].cells[1].textContent;
            console.log("Next track is: " + nextTrackName);

            changePlayer(nextTrackName, parseInt(currentNum)+1);
        }
    }
    if(event.data == 1){
        $("#pausePlayer")[0].name = "pause";
    }
    else if(event.data == 2){
        $("#pausePlayer")[0].name = "play";
    }
}

// Function: Plays previous/next track
function advancePlaylist(direction){
    // FIX when no tracks
    var move = 0;
    var tableRows = $("#tracks-table tr");
    var nextTrackName;
    
    if(direction == "forward"){
        move = 1;
        console.log("Playing next track...");
    }
    else{
        move = -1;
        console.log("Playing previous track...");
    }

    // end of playlist, last title in playlist, so go to first title
    if(currentNum+move > currPlaylist.tracks.length){
        nextTrackName = tableRows[1].cells[1].textContent;
        changePlayer(nextTrackName, 1);
    }
    // start of playlist, first title, so go to the last title
    else if(currentNum+move == 0){
        nextTrackName = tableRows[currPlaylist.tracks.length].cells[1].textContent;
        changePlayer(nextTrackName, currPlaylist.tracks.length);
    }
    // otherwise, play the next track
    else{
        nextTrackName = tableRows[currentNum+move].cells[1].textContent;     
        console.log("Next track is: " + nextTrackName);
        changePlayer(nextTrackName, parseInt(currentNum)+move);
    }
}

// Function: opens up volume rocker
function volumeRocker(){
    if(volumeVisible == true){
        volumeVisible = false;
        volumeUI.style.visibility = "hidden";
    }
    else{
        volumeVisible = true;
        volume = player.getVolume();
        volumeUI.value = volume;
        volumeUI.style.visibility = "visible";
    }
}

// Function: opens up theme picker
function openThemePicker(){
    if(themeVisible == true){
        themeVisible = false;
        themeUI.style.visibility = "hidden";
    }
    else{
        themeVisible = true;
        themeUI.style.visibility = "visible";
    }
}


//pls remove this later
changeTheme('#3c4f65', 1);

function changeTheme(newColor, darkMode){
    var bars = document.getElementsByClassName('bar');
    var themeUI = document.getElementById('themeUI');
    var controllerIcons = document.getElementsByClassName('controllerOption');
    var trackInfo = document.getElementsByClassName('track-info');
    var title = document.getElementById('main-head');
 
    // var bottomBar = document.getElementById('tracks-head');

    if(darkMode == 1){
        document.body.style.backgroundColor = "#33313b";
        
        title.style.backgroundColor = "white";

        for(var i = 0; i < controllerIcons.length; i++){
            controllerIcons[i].style.color = "white";
        }

        for(var i = 0; i < trackInfo.length; i++){
            trackInfo[i].style.backgroundColor = "#4d5f73"; 
            trackInfo[i].style.color = "#ffffff";
        }
    }
    else if(darkMode == 0){
        document.body.style.backgroundColor = "#E7ECEF";
        
        title.style.backgroundColor = "#565656";

        document.body.style.backgroundColor = "E7ECEF";
        for(var i = 0; i < controllerIcons.length; i++){
            controllerIcons[i].style.color = "black";  
        }
        
        for(var i = 0; i < trackInfo.length; i++){
            trackInfo[i].style.backgroundColor = "#E7ECEF"; 
            trackInfo[i].style.color = "black";
        }
    }   

    document.getElementsByClassName('controller')[0].style.backgroundColor = newColor;

    for(var i = 0; i < bars.length; i++){
        bars[i].style.backgroundColor = newColor;
    }

    // for(var i = 0; i < bottomBar.cells.length; i++){ 
    //     bottomBar.cells[i].style.backgroundColor = newColor
    // }
}

// Function: change player volume, fade in numeric volume, change text, fade out
// ISSUE: inefficient, CPU usage high when dragging back and forth (function calls)
volumeUI.oninput = function(){
    player.setVolume(this.value);
    document.getElementById("volumeText").innerHTML = this.value;
    $("#volumeText").show();
}

volumeUI.onmouseup = function(){
    $("#volumeText").delay(250).fadeOut(1250);
}