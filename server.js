var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var app = express();
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret:'sendsomesecretvalue',
    cookie: {maxAge: 1000*60*60*24*30}
}));

var config = {
    user: 'monikait3038',
    database: 'monikait3038',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var articles ={
'article-one': {
	title: 'Article One | Monika Srivastava',
	heading: 'Article one',
	date: '15 August',
	content: '<p>This is the content for the first article</p>'
},

'article-two':{
	title: 'Article Two | Monika Srivastava',
	heading: 'Article Two',
	date: '15 August',
	content: '<p>This is the content for the second article</p>'
}
};

function createTemplate(data){
	var title = data.title;
	var heading = data.heading;
	var date = data.date;
	var content = data.content;


var htmlTemplate = `
<html>
    <head>
        <link href="/ui/style.css" rel="stylesheet" />
    </head>
	<title>
	${title}
	</title>
    <body>
       <div>
	   <a href="/">home</a>
	   </div>
	   </hr>
	   <h3>
	   ${heading}
	   <div>
	   ${date.toDateString()}
	   </div>
	   <div>
	   <p>
	   ${content}
	   </div>
    </body>
</html>`;
return htmlTemplate;
}

var names =[];
app.get('/submit-name', function(req,res){
	//var name = req.params.name;
	var name = req.query.name;   //?name={value}
	names.push(name);
	res.send(JSON.stringify(names));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(){
    //how to get hash?
    var hashed = crypto.pbkdf2Sync('input', 'salt', 100000, 512, 'sha512');
    //return hashed.toString('hex');
    return ['pbkdf','1000', 'salt',  hashed.toString('hex')].join('$');
    
    // why not we are using normal md5 ?
    //bcz with normal md5 password = '33456jjfnjgfngjngjgn' - can be found some table
    // with pbkdf2Sync password + salt('this is some random string') = 'dsfdgfgfgfghghgjjhhhkjkjkjjjlkjlkjlkl' - cannot found in any table
    // also converted into 1000 times
    // pbkdfsync is more safe
}

app.get('/hash/:input',function(req,res){
var hashedString = hash(req.params.input , 'this is some random string');
res.send(hashedString);
});

app.post('/create-user',function(req,res){
    //json usename password
    // {"username": "username" , "password": "password"}
var username = req.body.username;
var password = req.body.password;
var salt = crypto.randomBytes(128).toString('hex');
var dbString = hash(password, salt);
pool.query('INSERT * FROM "user"(username,password) VALUES ($1,$2)',[username,dbString], function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            res.send('username successfully created'+username);
        }
    });

});

app.post('/login',function(req,res){
    //json usename password
    // {"username": "username" , "password": "password"}
var username = req.body.username;
var password = req.body.password;

pool.query('SELECT * FROM "user" WHERE username=1$',[username], function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            if(result.rows.length === 0){
             res.send(403).send('usename/password is invalid');   
            }
            else{
                var dbString = result.rows[0].password;
                var salt = dbString.split('$')[2];   
                //['pbkdf','1000', 'salt',  hashed.toString('hex')].join('$');
                var hashedPassword = hash(password,salt); // creating a hash with original salt
                if(hashedPassword ===dbString){
                    //set a session 
                    req.session.auth ={userId: result.rows[0].id};
                    
                   res.send('credential is correct'); 
                }
                else{
                 res.send('credential is wrong'); 
                }
            }
           
        }
    });

});

 app.get('/check-login',function(req,res) {
     
   if(req.session && req.session.auth && re.session.auth.userId){
       res.send('You are logged in');
   } 
   else{
      res.send('not logged in'); 
   }
 });

app.get('/logout',function(req,res) {
     
 delete req.session.auth;
 res.send('logout');
 });




var pool = new Pool(config);
app.get('/test-db', function (req, res) {
    //make a request to db
    pool.query('SELECT * FROM test', function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            res.send(JSON.stringify(result.rows));
        }
    });
});


var counter = 0;
app.get('/counter', function (req, res) {
  counter = counter + 1 ;
  res.send(counter.toString());
});

app.get('/articles/:articleName', function (req, res) {
//articleName == article-one
  articleName = req.params.articleName;
  
  //select * from article where title='article-one' ; DELETE where a='asdf'
  // we need safe title 
  //pool.query("SELECT * FROM article where title='" + req.params.articleName + "'", function(err,result){
  pool.query("SELECT * FROM article where title= $1",[req.params.articleName], function(err,result){
       if(err){
            res.status(500).send(err.toString());
        }
        else{
           if(result.rows.length === 0){
             res.status(404).send("article not found");  
           }
           else{
               var articleData = result.rows[0];
               res.send(createTemplate(articleData));
           }
        }
  });
  
});

app.get('/article-two', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article-two.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});

