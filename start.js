var http = require("http");
var url = require("url");
var fs = require("fs");
var qs = require("querystring");
var path = require("path");

// find element in an array
function isFound(array, element)
{
  var suffix = arguments[2]?arguments[2]:'';
  for(var i=0; i<array.length; ++i){
    if(array[i] == element + suffix){
      return true;
    }
  }
  return false;
}

// find a list of songs from files
function getSongs(files){
  var songs = [];
    for (var i = 0; i < files.length; ++i) {
      var songname = files[i].substr(0, files[i].length - 4);
      if (!isFound(songs, songname)) {
        songs.push(songname);
    }
  }  
  return songs;    
}

function start(route) {
  function onRequest(request, response) {
    // read category folder
    var cates = fs.readdirSync(path.join(process.cwd(), '/data/songs/'));
    // get pathname and query
    var pathname = url.parse(request.url).pathname;
    var query =  url.parse(request.url).query;

    // default route
    if (pathname == "/") {
      pathname += "index.html";
    }

    // full route
    pathname = path.join(process.cwd(), pathname);

    var suffix = pathname.substr(pathname.length - 3);
    //route(pathname);

    if (suffix == "tml") {
      // request html files
      response.writeHead(200, {
        "Content-Type": "text/html"
      });
      var page;
      try{
        page = fs.readFileSync(pathname, 'UTF-8');
      }
      catch(err){
        page = fs.readFileSync(path.join(process.cwd(), '/error404.html'), 'UTF-8');
        response.write(page);
        response.end();
      }

      if(pathname == path.join(process.cwd(), '/index.html')){
        // index
        var images;
        try{
          images = fs.readdirSync(path.join(process.cwd(),'/images/'));
        }
        catch(err){
          response.write(err);
          response.end();
        }

        for(var i = 0; i < cates.length ;++i){
          var tuple;
          
          if(!isFound(images, cates[i], '.jpg')){
            //tuple = '<section class="6u"><a href="category.html?categoryid=' 
            //+ i 
            //+ '" class="image-index full"><img src="data/meta/cate_cover.png" alt="CATE_NAME"></a><header><h2>CATE_NAME</h2></header><p></p></section>';
            tuple = '<section class="6u"><a href="category.html?categoryid=' 
            + i 
            + '" class="image-index full"><div class="cate_cover">CATE_NAME</div></a><header><h2>CATE_NAME</h2></header><p></p></section>';
          }
          else{
            tuple = '<section class="6u"><a href="category.html?categoryid=' 
            + i 
            + '" class="image-index full"><img src="images/CATE_NAME.jpg" alt="CATE_NAME"></a><header><h2>CATE_NAME</h2></header><p></p></section>';
          }

          tuple = tuple.replace(/CATE_NAME/g, cates[i]);
          var arr = page.split('END');
          page = arr[0] + tuple + 'END' + arr[1];
        }
        page = page.replace(/END/g, '');
        
      }
      else if (pathname == path.join(process.cwd(), '/category.html')){
        var catid = qs.parse(query)["categoryid"];
        var cate_name = cates[catid];
        var cate_folder = path.join(process.cwd(), '/data/songs/', cate_name);
        var files;
        try{
          files = fs.readdirSync(cate_folder);        
        }
        catch(err){
          response.write(err);
          response.end();
        }
        var songs = getSongs(files);
        
        page = page.replace(/CATE_NAME/g, cates[catid]);           
        page = page.replace(/SONGS_NUM/g, songs.length);

        for (var i = 0; i < songs.length; ++i) {
          var tuple;
          if(!isFound(files, songs[i], '.png')){
            //tuple = '<section class="2u"><a href="song.html?categoryid=' 
            // + catid + '&songid=' + i + '" class="image full"><img src="data/meta/cover.png" alt="SONGNAME"></a><header><h4>SONGNAME</h4></header></section>';
             tuple = '<section class="2u"><a href="song.html?categoryid=' 
             + catid + '&songid=' + i + '" class="image full"><div class="song_cover" title="SONGNAME">SONGNAME</div></a><header><h4>SONGNAME</h4></header></section>';
          }
          else{
            tuple = '<section class="2u"><a href="song.html?categoryid=' 
             + catid + '&songid=' + i + '" class="image full"><img alt="SONGNAME" title="SONGNAME" src="data/songs/'
             + cate_name 
             + '/SONGNAME.png" alt="SONGNAME"></a><header><h4>SONGNAME</h4></header></section>';
          }
          tuple = tuple.replace(/SONGNAME/g, songs[i]);
          var arr = page.split("END");
          page = arr[0] + tuple + "END" + arr[1];
        }

        page = page.replace(/END/g, '');
      }

      else if(pathname == path.join(process.cwd(), '/song.html')){
        // get category name and song name
        var catid; 
        var song_id;
        if(qs.parse(query)["categoryid"]){
          catid = qs.parse(query)["categoryid"];
        }
        else{
          catid = Math.floor(Math.random()*cates.length);
        }
        var cate_name = cates[catid];
        var cate_folder = path.join(process.cwd(), '/data/songs/', cate_name);

        var files;
        try{
          files = fs.readdirSync(cate_folder);
        }
        catch(err){
          response.write(err);
          response.end();
        }
        var songs = getSongs(files);  

        if(qs.parse(query)["songid"]){
          song_id = qs.parse(query)["songid"];
        }
        else{
          song_id = Math.floor(Math.random()*songs.length);
        }
        var song_name = songs[song_id];

        if(!isFound(files, song_name, '.png')){
          page = page.replace(/songs\/CATEGORY\/SONG_COVER/g, 'meta/cover');
        }
        else{
          page = page.replace(/SONG_COVER/g, song_name);
        }

        page = page.replace(/SONG_NAME/g, song_name);
        page = page.replace(/CATEGORY/g, cate_name);
        var song_lyric;
        try{
          song_lyric = fs.readFileSync(path.join(process.cwd(), 'data/songs/', cate_name, song_name + '.txt'), 'UTF-8');
        }
        catch(err){
          song_lyric = fs.readFileSync(path.join(process.cwd(), 'data/meta/lyrics.txt'), 'UTF-8');
        }
        page = page.replace(/SONG_LYRIC/g, song_lyric);
        
        // add recommended songs
        var relate_songs = [];
        for(var i = song_id - 5; i < song_id + 6; ++i){
          var this_song = i; 
          if(this_song != song_id){         
            while(this_song < 0){
              this_song += songs.length;
            }
            while(this_song > songs.length-1){
                this_song -= songs.length;
            }
            if(!isFound(relate_songs, this_song) && this_song != song_id){
              relate_songs.push(this_song);
            }
          }
        }

        var len = relate_songs.length < 5 ? relate_songs.length : 5;
        for(var i = 0; i < len; ++i){
          var tuple = '<li><a href="song.html?categoryid=' + catid 
            + '&songid=' + relate_songs[i] + '">' 
            + songs[relate_songs[i]] + '</a></li>';
          arr = page.split('END1');
          page = arr[0] + tuple + 'END1' + arr[1];
        }
        page = page.replace('END1', '');
        len = relate_songs.length < 10 ? relate_songs.length : 10;
        if(relate_songs.length > 5){
          for(var i = 5; i < len; ++i){
            var tuple = '<li><a href="song.html?categoryid=' + catid 
              + '&songid=' + relate_songs[i] + '">' 
              + songs[relate_songs[i]] + '</a></li>';
            arr = page.split('END2');
            page = arr[0] + tuple + 'END2' + arr[1];
          }
        }
        page = page.replace('END2', '');

      }

      // write back
      response.write(page);
      response.end();
    }

    else if (suffix == ".js") {
      response.writeHead(200, {
        "Content-Type": "application/x-javascript"
      });
      pathname = decodeURIComponent(pathname);
      fs.readFile(pathname, 'UTF-8', function(err, data) {
        if (err) {
          console.log(err);
        } else {
          response.write(data);
          response.end();
        }
      })
    } 

    else if (suffix == "css") {
      response.writeHead(200, {
        "Content-Type": "text/css"
      });
      pathname = decodeURIComponent(pathname);
      fs.readFile(pathname, 'UTF-8', function(err, data) {
        if (err) {
          console.log(err);
        } else {
          response.write(data);
          response.end();
        }
      })
    } 
    else if (suffix == "jpg") {
      response.writeHead(200, {
        "Content-Type": "application/x-jpg"
      });
      pathname = decodeURIComponent(pathname);
      fs.readFile(pathname, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          response.write(data);
          response.end();
        }
      })
    } 
    else if (suffix == "mp3") {
      response.writeHead(200, {
        "Content-Type": "audio/mp3"
      });
      pathname = decodeURIComponent(pathname);
      fs.readFile(pathname, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          response.write(data);
          response.end();
        }
      })
    } 
    else if (suffix == "png") {
      response.writeHead(200, {
        "Content-Type": "image/png"
      });
      pathname = decodeURIComponent(pathname);
      fs.readFile(pathname, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          response.write(data);
          response.end();
        }
      })
    }
    else if(suffix == "svg"){
      response.writeHead(200, {
        "Content-Type": "text/xml"
      });
      pathname = decodeURIComponent(pathname);
      fs.readFile(pathname, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          response.write(data);
          response.end();
        }
      })
    }
    else{
      response.writeHead(200, {
        "Content-Type": "application/octet-stream"
      });
      pathname = decodeURIComponent(pathname);
      fs.readFile(pathname, function(err, data) {
        if (err) {
          console.log(err);
        } else {
          response.write(data);
          response.end();
        }
      })
    }
  }
  http.createServer(onRequest).listen(process.env.VCAP_APP_PORT || 80, null);
  console.log("Server has started.");
}

exports.start = start;