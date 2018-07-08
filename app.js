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
app.set('view engine', 'html');


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

})



app.listen(3000,function(){// 3000번 포트 listen

  console.log('Connected, 3000 port!!');
});
