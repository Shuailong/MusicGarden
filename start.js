var http = require("http");
var url = require("url");
var fs = require("fs");
var qs = require("querystring");

var PREFIX = "/Projects/Github/MusicGarden"
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
      if (pathname == PREFIX + '/category.html') {
        var catid = qs.parse(query)["categoryid"];
        var cate_name = '';
        var cate_folder = '';
        if(catid == 1){
          cate_name = '金木水火土';
        }
        else if(catid ==2){
          cate_name = '遇见一个人的星光';
        }
        cate_folder = PREFIX + '/data/' + cate_name + '/';
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
        
        for (var i = 2; i < songs.length; ++i) {
          var tuple = '<section class="2u"><a href="song.html?categoryid=' 
           + catid + '&songid=' + i + '" class="image full"><img src="data/'
           + cate_name 
           + '/songname.png" alt=""></a><header><h4>songname</h4></header></section>';
          tuple = tuple.replace(/songname/g, songs[i]);

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
        if(catid == 1){
          cate_name = '金木水火土';
        }
        else if(catid ==2){
          cate_name = '遇见一个人的星光';
        }
        cate_folder = PREFIX + '/data/' + cate_name + '/';
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
        data = data.replace(/SONG_NAME/g, song_name);
        data = data.replace(/CATEGORY/g, cate_name);
        var song_lyric = fs.readFileSync('data/' + cate_name + '/' + song_name + '.txt', 'UTF-8');
        data = data.replace(/SONG_LYRIC/g, song_lyric);
        response.write(data);
        response.end();
      }
      else if(pathname == PREFIX + '/random.html'){
        pathname = PREFIX + '/song.html';
        // get file list
        var catid = Math.floor(Math.random()*2+1);

        var cate_name = '';
        var cate_folder = "";
        if(catid == 1){
          cate_name = '金木水火土';
        }
        else if(catid ==2){
          cate_name = '遇见一个人的星光';
        }
        cate_folder = PREFIX + '/data/' + cate_name + '/';
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

        var song_id = Math.floor(Math.random()*(songs.length-2)+2);
        var song_name = songs[song_id];
        response.writeHead(200, {
          "Content-Type": "text/html"
        });
        pathname = decodeURIComponent(pathname);
        var data = fs.readFileSync(pathname, 'UTF-8');
        data = data.replace(/SONG_NAME/g, song_name);
        data = data.replace(/CATEGORY/g, cate_name);
        var song_lyric = fs.readFileSync('data/' + cate_name + '/' + song_name + '.txt', 'UTF-8');
        data = data.replace(/SONG_LYRIC/g, song_lyric);
        response.write(data);
        response.end();
      }
      else{
        // other html files
        response.writeHead(200, {
        "Content-Type": "text/html"
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
  }
  http.createServer(onRequest).listen(8000);
  console.log("Server has started.");
}

exports.start = start;