const  RESULTS_PER_PAGE = 10;
var key = process.env.API_KEY;//key for google api request
var cx = process.env.CX;//personal search engine created through my Google account
var request = require('request');
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var searchTerm = require('./models/searchTerm');//require search term model to save all previous searches in MongoDB
app.use(express.static('public'));
mongoose.connect('mongodb://atalero:shortener@ds251245.mlab.com:51245/image-search-layer');//connect to my mongo
//again, this would normally be secured otherwise (will possibly fix this soon, otherwise anyone can hack my database :S)

//if recent searches is called, they are all queried for from MongoDB and displayed to the user
app.get('/recentsearches', (req,res,next) => {
  searchTerm.find({}, (err, data) => {
    res.json(data);
  });
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/imagesearch/:val', (req,res,next)=>{
  var {val} = req.params;
  var url = 'https://www.googleapis.com/customsearch/v1?q='+val+'&key='+key+'&cx='+cx+'&searchType=image&num=10'; 
  
  if (req.query.page !== undefined && req.query.page !== '1'){ 
    var offset = ((parseInt(req.query.page)-1)*10).toString();
    url = url +'&start='+ offset;
    console.log('this is the offset ' + offset);
  }
  
  /*
  This property (query) is an object containing a property for each query string parameter in the route. 
  If there is no query string, it is the empty object, {}.
  */
  
  const options = {  
    url: url,
    method: 'GET'
  };
  
  var results =[];
  
  request(options, function(err, rez, body) {  
    let json = JSON.parse(body);
    for(var i = 0 ; i < RESULTS_PER_PAGE; i++){
      results.push({
        url: json.items[i].link, 
        snippet: json.items[i].snippet ,
        thumbnail:json.items[i].image.thumbnailLink,
        context: json.items[i].image.contextLink
      });
    }
      res.send(results);
  });
  
  var data = new searchTerm ({
    searchValue : val,
    searchDate: new Date()
  });
  
  data.save(err => {
    if(err)return res.send('Error saving fo db!');
  });
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
