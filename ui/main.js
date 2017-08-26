//counter code
var button = document.getElementById('counter')
var counter = 0;
button.onclick = function(){

  // make a req to the endpoint
  //capture the res
//render variable
console.log("hello");

  // create a request
 var request = new XMLHttpRequest();
  //capture the responses and store it in variable

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE){
      //TAKE SOME ACTION
      if(request.status === 200){
        var counter = request.responseText;
        var span = document.getElementById('count');
        span.innerHTML = counter.toString();
      }
    }
  };
  //Make the request
  request.open('GET' , 'http://monikait3038.imad.hasura-app.io/counter' , true);
  request.send(null);
  };
  // submit name
  var submit = document.getElementById('submit_btn');
  submit.onclick =function(){

    // create a request
   var request = new XMLHttpRequest();
    //capture the responses and store it in variable

    request.onreadystatechange = function(){
      if(request.readyState === XMLHttpRequest.DONE){
        //TAKE SOME ACTION
        if(request.status === 200){
          var names = request.responseText;
          names= JSON.parse(names);

          var list = '';
          for(var i=0; i<names.length;i++){

            list += '<li>' + names[i] + '</li>';
          }
          var ul = document.getElementById('namelist');
          ul.innerHTML = list;
        }
      }
    };
    //Make the request
    var nameInput = document.getElementById('name');
    var name = nameInput.value;
    request.open('GET' , 'http://monikait3038.imad.hasura-app.io/submit-name?name='+name , true);
    request.send(null);

};

