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
    //console.log('===============new Rating==================')
    //var replyObj = {};
    //var loginObj = req.body.loginObj.allPhones
    //var newRecs = []
    //if (req.body.status === 'Liked'){
    //    raccoon.input.liked(req.body.loginObj.userId, req.body.phoneId, function(){
    //        raccoon.stat.recommendFor(req.body.loginObj.userId, 15, function(recs){
    //            console.log('recs liked', recs);
    //            raccoon.stat.mostSimilarUsers(req.body.loginObj.userId, function(simUsers){
    //                raccoon.stat.bestRatedWithScores(9, function(bestRated){
    //                    for(var i in loginObj){
    //                        if(loginObj.hasOwnProperty(i)){
    //                            for(var j=0;j<recs.length;j++){
    //                                if(loginObj[i]._id == recs[j]){
    //                                    newRecs.push(loginObj[i].name)
    //                                }
    //                            }
    //
    //                        }
    //                    }
    //                    replyObj = {
    //                        recommendations: newRecs,
    //                        similarUsers: simUsers,
    //                        bestScores: bestRated
    //                    };
    //                    console.log('replyObj', replyObj);
    //                    res.send(replyObj);
    //                });
    //            });
    //        });
    //    });
    //} else {
    //    raccoon.input.disliked(req.body.loginObj.userId, req.body.phoneId, function(){
    //        raccoon.stat.recommendFor(req.body.loginObj.userId, 15, function(recs){
    //            console.log('recs disliked', recs);
    //            raccoon.stat.mostSimilarUsers(req.body.loginObj.userId, function(simUsers){
    //                raccoon.stat.bestRatedWithScores(9, function(bestRated){
    //                    replyObj = {
    //                        recommendations: recs,
    //                        similarUsers: simUsers,
    //                        bestScores: bestRated
    //                    };
    //                    console.log('replyObj', replyObj);
    //                    res.send(replyObj);
    //                });
    //            });
    //        });
    //    });
    //}
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
