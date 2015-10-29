/**
 * Created by slit on 27/10/15.
 */
    exports.starter = function (urlOfDB) {
        var async = require('async'),
            mongoose = require('mongoose'),
            _ = require('underscore'),
            csv = require('csv'),
            raccoon = require('raccoon');
        var headers;
        if (raccoon.config.localSetup === true){
            console.log('local mongo');
            mongoose.connect(raccoon.config.localMongoDbURL);
        } else {
            console.log('remote mongo');
            mongoose.connect(raccoon.config.remoteMongoDbURL);
        }
        var phoneSchema = mongoose.Schema({
            name: String
        });
        var Phone = mongoose.model('Phone', phoneSchema);
        var userSchema = mongoose.Schema({
            name: String
        });
        var User = mongoose.model('User', userSchema);

        if (raccoon.config.flushDBsOnStart){
            console.log('flushing');
            User.find().remove({});
            Phone.find().remove({});
        }
        module.exports = {
            User: User,
            Phone: Phone
        };
        var insertPhones = function(phoneName){
            var phoneData = {
                name: phoneName
            };
            var phone = new Phone(phoneData);
            phone.save();
        };
        var insertRow = function(row, headers){
            var userData = {
                name: row[0]
            };
            var user = new User(userData);
            user.save(function(){
                for (var j = 1; j < row.length; j++){
                    if (row[j] > 0){
                        insertUserPhoneLists(row[0], headers[j], row[j]);
                    }
                }
            });
        };
        var insertUserPhoneLists = function(userName, phoneName, rating){
            //console.log('=======USerName=============== '+userName)
            User.findOne({name:userName}, function(err, userData){
                //console.log('=========userDatasasas======================== '+userData)
                Phone.findOne({name:phoneName}, function(err, phoneData){
                    if (rating > 3){
                        raccoon.input.liked(userData._id, phoneData._id, function(){});
                    } else if (rating < 3) {
                        raccoon.input.disliked(userData._id, phoneData._id, function(){});
                    } else {
                        if (function(){return Math.floor(Math.random()*1.5)}===1){
                            raccoon.input.liked(userData._id, phoneData._id, function(){});
                        } else {
                            raccoon.input.disliked(userData._id, phoneData._id, function(){});
                        }
                    }
                    // input.userList(userData._id);
                    // input.itemList(phoneData._id);
                });
            });
        };
        var findOrCreateUser = function(username, callback){
            User.findOne({name:username}, function(err, userData){
                if (userData === null){
                    var newUser = {
                        name: username
                    };
                    var user = new User(newUser);
                    user.save(function(){
                        User.findOne({name:username}, function(err, newUserData){
                            callback(newUserData._id);
                        });
                    });
                } else {
                    //console.log('=====userDAATA=============== '+userData)
                    callback(userData._id);
                }
            });
        };
        var buildLoginObject = function(userName, callback){
            console.log('============inside buildLoginObject=======================')
            var loginObject = {};
            findOrCreateUser(userName, function(userId){
                User.find({}, function(err, userResults){
                    //console.log('=======userResults==================== '+userResults)
                    Phone.find({}, function(err, phoneResults){
                        //console.log('======phoneResults================ '+phoneResults)
                        raccoon.stat.allWatchedFor(userId, function(allWatched){
                            //console.log('========allwatched============ '+allWatched)
                            raccoon.stat.recommendFor(userId, 30, function(recs){
                                //console.log('==========recoms=========== '+recs)
                                loginObject = {
                                    username: userName,
                                    userId: userId,
                                    alreadyWatched: allWatched,
                                    allUsers: userResults,
                                    allPhones: phoneResults,
                                    recommendations: recs
                                };
                                console.log('======loginObj=============== ')
                                //console.log(loginObject.allPhones)

                                callback(loginObject);
                            });
                        });
                    });
                });
            });
        };

        var buildRecommendationObject = function (userId, phoneId,status, callback) {
            console.log('===============new Rating==================')
            var replyObj = {};

            if (status === 'Liked'){
                raccoon.input.liked(userId, phoneId, function(){
                    raccoon.stat.recommendFor(userId, 15, function(recs){
                        console.log('recs liked', recs);
                        raccoon.stat.mostSimilarUsers(userId, function(simUsers){
                            raccoon.stat.bestRated(function(bestRated){

                                Phone.find({
                                    '_id': {
                                        '$in': recs
                                    }
                                }, function (err,docs) {
                                    if(err){
                                        console.log(err)
                                    }else{
                                        console.log(docs)
                                        User.find({
                                            '_id': {
                                                '$in': simUsers
                                            }
                                        }, function (err, users) {
                                            if(err){
                                                console.log(err)
                                            }else{
                                                replyObj = {
                                                    recommendations: docs,
                                                    similarUsers: users,
                                                    TopFeatured: bestRated
                                                };
                                                console.log('replyObj', replyObj);
                                                callback(replyObj);
                                            }
                                        })
                                    }
                                })


                            });
                        });
                    });
                });
            } else {
                raccoon.input.disliked(userId, phoneId, function(){
                    raccoon.stat.recommendFor(userId, 15, function(recs){
                        console.log('recs disliked', recs);
                        raccoon.stat.mostSimilarUsers(userId, function(simUsers){
                            raccoon.stat.bestRatedWithScores(9, function(bestRated){
                                Phone.find({
                                    '_id': {
                                        '$in': recs
                                    }
                                }, function (err,docs) {
                                    if(err){
                                        console.log(err)
                                    }else{
                                        User.find({
                                            '_id': {
                                                '$in': simUsers
                                            }
                                        }, function (err, users) {
                                            if(err){
                                                console.log(err)
                                            }else{
                                                replyObj = {
                                                    recommendations: docs,
                                                    similarUsers: users,
                                                    bestScores: bestRated
                                                };
                                                console.log('replyObj', replyObj);
                                                callback(replyObj);
                                            }
                                        })
                                    }
                                })
                            });
                        });
                    });
                });
            }
        }

        return {
            buildLoginObject: buildLoginObject,
            buildRecommendationObject: buildRecommendationObject,
            importCSV: function(callback){
                console.log('==import CSV=======================')
                csv().from.path(__dirname+'/phonerecs.csv', {delimiter: ',', escape: ''})
                    .on('record', function (row,index) {
                        if(index == 0){
                            for(var i=0;i<row.length;i++){
                                insertPhones(row[i])
                                headers = row
                            }
                        }else{
                            insertRow(row, headers)
                        }
                    })
                    .on('end', function () {
                    })
                    .on('error', function (error) {
                        console.log(error.message)
                    })
            }
        }
    };

