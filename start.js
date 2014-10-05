var http = require("http");
var url = require("url");
var fs = require("fs");
var qs = require("querystring");

var PREFIX = "/Projects/Github/MusicGarden";

function start(route) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    var query =  url.parse(request.url).query;
    // default route
    if (pathname == "/") {
      pathname += "index.html";
    }

    // full route
    pathname = PREFIX + pathname;

    var suffix = pathname.substr(pathname.length - 3);
    //route(pathname);

    if (suffix == "tml") {
      // request html files
      response.writeHead(200, {
        "Content-Type": "text/html"
      });
      if(pathname == PREFIX + '/index.html'){
        // index
        pathname = decodeURIComponent(pathname);
        var data = fs.readFileSync(pathname, 'UTF-8');
        var cates = fs.readdirSync(PREFIX + '/data/songs/');
        var images = fs.readdirSync(PREFIX + '/images/');
        for(var i = 0; i < cates.length ;++i){
          var tuple;
          
          var j;
          for(j = 0; j < images.length; ++j){
            if(images[j] == cates[i] + '.jpg'){
              break;
            }
          }
          if(j == images.length){
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
          var arr = data.split('END');
          data = arr[0] + tuple + 'END' + arr[1];
        }

        response.write(data);
        response.end();
      }
      else if (pathname == PREFIX + '/category.html') {
        var catid = qs.parse(query)["categoryid"];
        var cate_name = '';
        var cate_folder = '';
        var cates = fs.readdirSync(PREFIX + '/data/songs/');
        cate_name = cates[catid];

        cate_folder = PREFIX + '/data/songs/' + cate_name + '/';
        files = fs.readdirSync(cate_folder);
      
        var songs = [];
        for (var i = 0; i < files.length; ++i) {
          var songname = files[i].substr(0, files[i].length - 4);
          var j;
          for (j = 0; j < songs.length; ++j) {
            if (songname == songs[j]) {
              break;
            }
          }
          if (j == songs.length) {
            songs.push(songname);
          }
        }            

        pathname = decodeURIComponent(pathname);
        var data = fs.readFileSync(pathname, 'UTF-8');
        var res = data;
        
        res = res.replace(/CATE_NAME/g, cate_name);
        var count =  songs.length;
           
        res = res.replace(/SONGS_NUM/g, count);
        for (var i = 0; i < songs.length; ++i) {
          var tuple;
          var j;
          for(j = 0; j < files.length; ++j){
            if(files[j] == songs[i] + '.png'){
              break;
            }
          }
          if(j == files.length){
            //tuple = '<section class="2u"><a href="song.html?categoryid=' 
            // + catid + '&songid=' + i + '" class="image full"><img src="data/meta/cover.png" alt="SONGNAME"></a><header><h4>SONGNAME</h4></header></section>';
             tuple = '<section class="2u"><a href="song.html?categoryid=' 
             + catid + '&songid=' + i + '" class="image full"><div class="song_cover">SONGNAME</div></a><header><h4>SONGNAME</h4></header></section>';
          }
          else{
            tuple = '<section class="2u"><a href="song.html?categoryid=' 
             + catid + '&songid=' + i + '" class="image full"><img src="data/songs/'
             + cate_name 
             + '/SONGNAME.png" alt="SONGNAME"></a><header><h4>SONGNAME</h4></header></section>';
          }
          tuple = tuple.replace(/SONGNAME/g, songs[i]);

          var arr = res.split("END");
          res = arr[0] + tuple + "END" + arr[1];
        }
        response.write(res);
        response.end();
      }

      else if(pathname == PREFIX + '/song.html'){
        // get file list
        var catid = qs.parse(query)["categoryid"];
        var cate_name = '';
        var cate_folder = "";

        var cates = fs.readdirSync(PREFIX + '/data/songs/');
        cate_name = cates[catid];

        cate_folder = PREFIX + '/data/songs/' + cate_name + '/';
        files = fs.readdirSync(cate_folder);
        var songs = [];
        for (var i = 0; i < files.length; ++i) {
          var songname = files[i].substr(0, files[i].length - 4);
          var j;
          for (j = 0; j < songs.length; ++j) {
            if (songname == songs[j]) {
              break;
            }
          }
          if (j == songs.length) {
            songs.push(songname);
          }
        }

        var song_id = qs.parse(query)["songid"];
        var song_name = songs[song_id];

        response.writeHead(200, {
          "Content-Type": "text/html"
        });
        pathname = decodeURIComponent(pathname);
        var data = fs.readFileSync(pathname, 'UTF-8');

        var i;
          for(i = 0; i < files.length; ++i){
            if(files[i] == songs[song_id] + '.png'){
              break;
            }
          }
          if(i == files.length){
            data = data.replace(/songs\/CATEGORY\/SONG_COVER/g, 'meta/cover');
          }
          else{
            data = data.replace(/SONG_COVER/g, song_name);
          }

        data = data.replace(/SONG_NAME/g, song_name);
        data = data.replace(/CATEGORY/g, cate_name);
        var song_lyric;
        try{
          song_lyric = fs.readFileSync('data/songs/' + cate_name + '/' + song_name + '.txt', 'UTF-8');
        }
        catch(err){
          song_lyric = fs.readFileSync('data/meta/lyrics.txt', 'UTF-8');
        }
        data = data.replace(/SONG_LYRIC/g, song_lyric);
        response.write(data);
        response.end();
      }
      else if(pathname == PREFIX + '/random.html'){
        pathname = PREFIX + '/song.html';
        // get file list
        var cates = fs.readdirSync(PREFIX + '/data/songs/');

        var catid = Math.floor(Math.random()*cates.length);

        var cate_name = '';
        var cate_folder = '';
        cate_name = cates[catid];
        cate_folder = PREFIX + '/data/songs/' + cate_name + '/';
        files = fs.readdirSync(cate_folder);
        var songs = [];
        for (var i = 0; i < files.length; ++i) {
          var songname = files[i].substr(0, files[i].length - 4);
          var j;
          for (j = 0; j < songs.length; ++j) {
            if (songname == songs[j]) {
              break;
            }
          }
          if (j == songs.length) {
            songs.push(songname);
          }
        }

        var song_id = Math.floor(Math.random()*songs.length);
        var song_name = songs[song_id];
        response.writeHead(200, {
          "Content-Type": "text/html"
        });
        pathname = decodeURIComponent(pathname);
        var data = fs.readFileSync(pathname, 'UTF-8');

        var i;
        for(i = 0; i < files.length; ++i){
          if(files[i] == songs[song_id] + '.png'){
            break;
          }
        }
        if(i == files.length){
          data = data.replace(/songs\/CATEGORY\/SONG_COVER/g, 'meta/cover');
        }
        else{
          data = data.replace(/SONG_COVER/g, song_name);
        }

        data = data.replace(/SONG_NAME/g, song_name);
        data = data.replace(/CATEGORY/g, cate_name);
        var song_lyric;
        try{
          song_lyric = fs.readFileSync('data/songs/' + cate_name + '/' + song_name + '.txt', 'UTF-8');
        }
        catch(err){
          song_lyric = fs.readFileSync('data/meta/lyrics.txt', 'UTF-8');
        }
        data = data.replace(/SONG_LYRIC/g, song_lyric);
        response.write(data);
        response.end();
      }
      else if(pathname == PREFIX + '/about.html'){
        // about page
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
      else{
        // other html files
        pathname = 'error404.html';
        fs.readFile(pathname, 'UTF-8', function(err, data) {
          if (err) {
            console.log(err);
          } else {
            response.write(data);
            response.end();
          }
        })
      }
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
  http.createServer(onRequest).listen(8000);
  console.log("Server has started.");
}

exports.start = start;