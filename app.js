var express = require('express'),
    raccoon = require('raccoon'),
    path = require('path'),
    util = require('util'),
    bodyParser = require('body-parser'),
    starter = require('./sampleContent/starter.js').starter(),
    routes = require('./routes');
    app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use( bodyParser.json() );
require('./routes/index')(app)

app.get('/importPhones', function (req,res) {
    starter.importCSV();
    res.send('SUCCESS')
});
app.post('/login', function(req, res){
    console.log('=======inside login========================= '+util.inspect(req.body.userName))
    starter.buildLoginObject(req.body.userName, function(object){
        res.send(object);
    });
});
app.post('/newRating', function(req, res){
    console.log('userId: '+req.body.loginObj.userId+' PhoneId: '+req.body.phoneId+' Status: '+req.body.status)
    starter.buildRecommendationObject(req.body.loginObj.userId, req.body.phoneId, req.body.status, function (obj) {
        res.send(obj)
    })
});
app.post('/phoneLikes', function(req, res){
    console.log('========inside movieLikes=====================================')
    var replyObj = {};
    raccoon.stat.likedBy(req.query[':phoneId'], function(likes){
        raccoon.stat.dislikedBy(req.query[':phoneId'], function(dislikes){
            replyObj = {
                likedBy: likes,
                dislikedBy: dislikes
            };
            res.send(replyObj);
        });
    });
});

app.listen(3000, function () {
    console.log('Listening on 3000')
})
