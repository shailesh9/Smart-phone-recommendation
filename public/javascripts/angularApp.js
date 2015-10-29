/**
 * Created by slit on 27/10/15.
 */

var app = angular.module('mobileReco', ['ngRoute']);


app.controller('MainCtrl', function($scope,$http){

    var shuffleArray = function(array) {
        var m = array.length, t, i;

        // While there remain elements to shuffle
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);

            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }

        return array;
    }
    console.log('=====================')
    hasLiked = false
    $scope.getName = function () {
        myname = $scope.name;
    }
    $scope.likeSubmit = function (inc, loginObj, phoneId) {
        $scope.myVar = false;
        if(inc>0){
            //console.log('LIKED')
            $http({
                url: '/newRating',
                method: 'POST',
                data: {
                    'status': 'Liked',
                    'loginObj': loginObj,
                    'phoneId': phoneId
                },
                headers: {'Content-Type': 'application/json'}
            })
                .then(function (res) {
                    $scope.myVar = !$scope.myVar;
                    //console.log(res.data)
                    $scope.replyObj = shuffleArray(res.data.recommendations)
                    $scope.replyObj2 = shuffleArray(res.data.similarUsers)
                    $scope.replyObj3 = res.data.bestScores;
                })
        }else if(inc<0){
            console.log('DISLIKED')
            $http({
                url: '/newRating',
                method: 'POST',
                data: {
                    'status': 'Disliked',
                    'loginObj': loginObj,
                    'phoneId': phoneId
                },
                headers: {'Content-Type': 'application/json'}
            })
                .then(function (res) {
                    $scope.myVar = !$scope.myVar;
                    //console.log('==========DISLIKED==================')
                    //console.log(res.data)
                    $scope.replyObj1 = shuffleArray(res.data.recommendations)
                    $scope.replyObj2 = shuffleArray(res.data.similarUsers)
                })
        }
    }

    })
.directive('form', function ($http) {
       // $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        return{
            restrict: 'E',
            link: function(scope,elem){
                elem.on('submit', function () {
                    console.log('=====submitting===========')
                    $http({
                        url: '/login',
                        method: "POST",
                        data: { 'userName' : myname },
                        headers: {'Content-Type': 'application/json'}
                    }).then(function (res) {

                        scope.phones = res.data.allPhones
                        scope.myObj = res.data
                    })
                })
            }
        }
    });



