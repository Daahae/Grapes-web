var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var bodyParser= require('body-parser');
var multer = require('multer');
var static = require('serve-static');
var engines = require('consolidate');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mysql = require('mysql');
var formidable = require('formidable');
var fs = require('fs');
var sanitize = require("sanitize-filename");
var date = require('date-utils');

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

app.set('views', __dirname + '/view');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');//default엔진을 html로

app.use(static(path.join(__dirname,'/view')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('images'));//정적인 이미지 저장공간 접근 허용 images폴더
app.use(express.static('tempurl'));
app.use(express.static('css'));
app.use(express.static('js'));
app.use(cookieParser());
app.use(session({
  key: 'sid', // 세션키
  secret: 'secret', // 비밀키
  cookie: {
    maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
  }
}));

var conn = mysql.createConnection({//db계정 로그인
  host     : 'localhost',
  user     : 'root',
  password : '111111',// 수정 필
  database : 'sns_project3'
});

conn.connect();
//기본 설정들



app.get('/',function(req,res){// 홈
    var name = req.session.displayName;
    var id = req.session.userID;
    if(name){//로그인했을시

    var sql = 'select * from article where owner = ? ';
    conn.query(sql,[id],function(err, article_me, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Err');
        }else{

          var id = req.session.userID;
          var sql = 'select * from article where owner in (select id2 from friend where id1 = ?)';
                 conn.query(sql, [id],function(err, article_f, fields){
                   if(err){
                     console.log(err);
                     res.status(500).send(id);
                   }else{
                     console.log(article_f);
                     res.render('main.html',{name: name, article_me: article_me, article_f: article_f});
                }
              });
        }
      });
    }

    else {//로그인 기록이 없을 시
      res.redirect('/login');
    }

});


app.get('/login',function(req,res){//로그인
  var newDate = new Date();



  function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);//한시간동안 세션 유지

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }
  var date = convertUTCDateToLocalDate(new Date('yyyy-mm-dd hh:mm:ss'));
  var time = date.toLocaleString();

  if(!req.session.userID){
    console.log(time);
    res.render('login.html');
  } else {
    res.redirect('/');
  }
});

app.post('/login_receiver',function(req,res){// 홈에서 로그인 정보를 받음

  var sql = 'select * from account';// 이미지는 차후에
  var cnt=0;

  conn.query(sql, function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Err');
    }
    console.log(result.length);


    var myid = req.body.userID;//로그인 페이지에서 입력한 정보
    var mypw = req.body.password;



    for(var i=0; i<result.length;i++){//db에 있는 정보들과 대조
      if(myid===result[i].id && mypw===result[i].password) {
        // displayName 세션 생성 - 로그인 여부 확인
          cnt = 1;
        req.session.img = result[i].image;
        req.session.userID = myid;// 세션에 올리기
        req.session.displayName = result[i].name;
        req.session.save(() => {

            res.redirect('/');
        });

      }
    }
      if(cnt == 0)// 로그인 실패시
        res.redirect('/');
    });
});





// Logout
app.get('/logout', (req, res) => {
  delete req.session.displayName;
  req.session.save(() => {
    res.render('login.html');
  });
});


app.get('/temp', (req, res) => {// 새글쓰기 temp
  var name = req.session.displayName;

  res.render('pom.html',{name: name});
});
// Delete temporary xml used for image update.
app.get('/tempdelete', function(req, res) {
  if (!process.env.PWD) {
      process.env.PWD = process.cwd();
  }
  tmp_path = path.join(process.env.PWD, '/tempurl/', req.query.tmpkey + '.xml');
  fs.unlink(tmp_path, function(err) {
    console.log('XML removed : ' + req.query.tmpkey);
  });
});





app.post('/pom',function(req,res){// 새 글쓰기
//  console.log(req.session.userID);
//  console.log(req.session.displayName);
//  console.log(req.session.img);
  var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (!process.env.PWD) {
            process.env.PWD = process.cwd();
        }
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            new_path = path.join(process.env.PWD, '/images/', files.file.name);
            console.log(new_path);
            req.session.pomimg = files.file.name;


        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'success': false});
                    } else {
                        res.status(200);
                        res.json({'success': true});

                        var tmp_path = path.join(process.env.PWD, '/tempurl/', fields.tmpkey + '.xml');
                        console.log(tmp_path);
                        xml = '<rss xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">';
                        xml += ('<filename>' + files.file.name + '</filename>');
                        xml += ('<url>/' + files.file.name + '</url>');
                        xml += '</rss>';
                        fs.writeFile(tmp_path, xml, function(err) {
                        console.log('XML created : ' + fields.tmpkey);
                      });
                    }
                });
            });
        });
    });
});

app.get('/profile',function(req,res){// 내 정보 보기
  var name = req.session.displayName;
  var id = req.session.userID;
  var img = req.session.img;// 로그인한 유저의 정보들
  var fname = req.session.fname;
  var fid = new Array();
  var flag=0;

  if(!req.session.profile)
    req.session.profile= 0;

  flag = req.session.profile;
  req.session.profile = 0;

  var sql = 'select * from friend where id1 = ?';
  conn.query(sql,[id],function(err, results, fields){
      for(i=0;i< results.length;i++){
        fid[i] = results[i].fname;
      };
      res.render('profile.html',{name: name, id:id, img:img, fid:fid, flag:flag, fname, fname});//name 수정
    });//친구인 id 모두 추출

});

app.get('/register',function(req, res){// 회원가입

  res.render('signup.html');
});




app.post('/register_receiver',function(req, res){// 회원가입 정보받기
    var userID = req.body.userID;
    var password =req.body.username;
    var username = req.body.password;


    var sql = 'INSERT INTO account VALUES (?, ?, ?, ?)';
    conn.query(sql,[userID, username, password,'worldcup.jpg'],function(err, results, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Err');
          }else{
            console.log('Success');
            res.redirect('/');
          }
    });//삽입
});


app.post('/pom_receiver',function(req, res){// 새글쓰기 백엔드처리
  var  title = req.body.title;
  var  body =req.body.content;
  var  image = req.body.url;

    console.log(title+"out "+ body);

    var newDate = new Date();
    var time = newDate.toFormat('YYYY-MM-DD');
    var name = req.session.displayName;

    var sql = 'INSERT INTO article( owner, title, image, body, time)  VALUES   (?, ?, ?, ?, ?)';
    conn.query(sql,[ req.session.userID,title ,image, body, time],function(err, results, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Err');
          }else{
            console.log('Success');
            res.redirect('/');

          }
    });//삽입



});

app.post('/profile_insert',function(req,res){//친구추가
  var id = req.body.search_ID;
  var tid = req.body.search_ID; // 받아온 아이디
  var sid = req.session.userID;
  console.log(tid);
  var sql = 'select * from account where id = ? and id != ?';// 해당아이디 여부 검색
  conn.query(sql,[tid, sid],function(err, friends, fields){
      if(err){
        res.status(500).send('Internal Server Err');
      }else if(friends.length == 0){
              console.log('해당하는 아이디가 없습니다.');
              req.session.profile = -1;// 검색 실패시 -1
              res.redirect('/profile');
      }
      else{

          var sql = 'INSERT INTO friend(id1,  id2, fname)  VALUES   (?, ?, ?)';
          conn.query(sql,[req.session.userID, id, friends[0].name],function(err, results, fields){// 추가한 친구 이름 삽입
              if(err){
                console.log(err);
                res.status(500).send('Internal Server Err');

                }else{
                  console.log('insert1 success');

                }
          });

          var sql = 'INSERT INTO friend(id2,  id1, fname)  VALUES   (?, ?, ?)';
          conn.query(sql,[req.session.userID, id, req.session.displayName],function(err, results, fields){// 내 이름 삽입
              if(err){
                console.log(err);
                res.status(500).send('Internal Server Err');

                }else{
                  console.log('insert2 success');
              }
          });
          req.session.profile=2;// 추가 되었음을 알림
          req.session.fname = friends[0].name;// 추가된 친구 이름 세션에 저장
          res.redirect('/profile');
        }
      });

});

app.post('/profile_search',function(req,res){//검색
  var tid = req.body.search_ID; // 받아온 아이디
  console.log(tid);
  var sql = 'select * from account where id = ? and id != ?';// 해당아이디 여부 검색
  conn.query(sql,[tid, req.session.userID],function(err, results, fields){
      if(err){
        res.status(500).send('Internal Server Err');
      }else if(results.length == 0){
              console.log('해당하는 아이디가 없습니다.');
              req.session.profile = -1;// 검색 실패시 -1
              res.redirect('/profile');
      }
      else{
        req.session.profile = 1;// 검색 성공시 1, 평소엔 0
        req.session.fname = results[0].name;
        res.redirect('/profile');
      }
  });




});
app.post('/profile_delete',function(req,res){//삭제
  var id1 = req.session.userID;// 로그인 아이디
  var id2 = req.body.search_ID; // 받아온 아이디
  var tid = req.body.search_ID; // 받아온 아이디
  console.log(tid);
  var sql = 'select * from friend where id2 = ?';// 해당아이디 여부 검색
  conn.query(sql,[tid],function(err, friends, fields){
      if(err){
        res.status(500).send('Internal Server Err');
      }else if(friends.length == 0){
              console.log('해당하는 아이디가 없습니다.');
              req.session.profile = -1;// 검색 실패시 -1
              res.redirect('/profile');
      }
      else{
          console.log(friends);
          var sql = 'Delete from friend where id1 = ? and id2 = ?';
          conn.query(sql,[id1, id2],function(err, results, fields){
              if(err){
                console.log(err);
                res.status(500).send('Internal Server Err');
                }else{
                  console.log('delete1 success');

                }
          });

          var sql = 'Delete from friend where id1 = ? and id2 = ?';
          conn.query(sql,[id2, id1],function(err, results, fields){
              if(err){
                console.log(err);
                console.log(err);
                res.status(500).send('Internal Server Err');

                }else{
                  console.log('delete2 success');
              }
              });
        req.session.profile=-2;// 삭제 되었음을 알림
        req.session.fname = friends[0].fname;// 삭제된 친구 이름 세션에 저장
        res.redirect('/profile');


    }
  });


});

app.listen(3443,function(){// 3000번 포트 listen

  console.log('Connected, 3443 port!!');
});
