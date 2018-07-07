var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var bodyParser= require('body-parser');
var multer = require('multer');
var static = require('serve-static');
var engines = require('consolidate');

app.set('views', __dirname + '/view');
app.engine('html', require('ejs').renderFile);



app.use(static(path.join(__dirname,'/view')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('images'));//정적인 이미지 저장공간 접근 허용 images폴더
app.use(express.static('css'));
//기본 설정들




app.get('/',function(req,res){// 홈
  res.send('<h1>Home Page</h1>');

})


app.get('/login',function(req,res){//로그인
  res.render('login.html');

})


app.listen(3000,function(){// 3000번 포트 listen

  console.log('Connected, 3000 port!!');
});
