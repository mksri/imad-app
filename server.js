var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var app = express();
app.use(morgan('combined'));

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


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});

