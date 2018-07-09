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

app.set('views', __dirname + '/view');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');//default엔진을 html로


app.use(static(path.join(__dirname,'/view')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('images'));//정적인 이미지 저장공간 접근 허용 images폴더
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
  password : '000000',
  database : 'sns_project3'
});

conn.connect();
//기본 설정들




app.get('/',function(req,res){// 홈
    var name = req.session.displayName;
    if(name)//로그인했을시
      res.render('main.html',{name:name});

    else {//로그인 기록이 없을 시

      res.redirect('/login');
    }

})


app.get('/login',function(req,res){//로그인
  if(!req.session.userID){
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

app.get('/pom',function(req,res){// 새 글쓰기
  console.log(req.session.userID);
  console.log(req.session.displayName);
  console.log(req.session.img);

  res.render('pom.html');
});

app.get('/profile',function(req,res){// 내 정보 보기
  var name = req.session.displayName;
  var id = req.session.userID;
  var img = req.session.img;// 로그인한 유저의 정보들
  var fid = new Array();



  var sql = 'select id2 from friend where id1 = ?';
  conn.query(sql,[id],function(err, results, fields){

      for(i=0;i< results.length;i++){
        fid[i] = results[i].id2;

      };
      console.log(fid);
      res.render('profile.html',{name: name, id:id, img:img, fid:fid});
});//친구인 id 모두 추출

});




app.listen(3000,function(){// 3000번 포트 listen

  console.log('Connected, 3000 port!!');
});
