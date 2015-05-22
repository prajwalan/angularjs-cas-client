var app = angular.module('myApp', ['ngRoute', 'ngCookies']);

app.constant('cfg', {
    serviceurl_base : 'https://localhost:8443/library',
    casurl_base : 'https://localhost:8443/cas',
    username: 'user1',
    password: 'password1'
})

app.run(['$http', '$cookies', function ($http, $cookies) {
            $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
        }
    ]);

app.controller('RESTController', function (cfg, $scope, $http, $window) {

    $scope.tgt = "";
    $scope.btn_disabled = true;
    
    $scope.login = function () {
        doCasAuthenticate();
    }

    $scope.logout = function () {
        doCasDeauthenticate();
    }
    
    $scope.casAuthenticate = function () {
        doCasAuthenticate("false");
    }

    $scope.casDeauthenticate = function () {
        doCasDeauthenticate();
    }

    $scope.getBooks = function () {
        doGet(cfg.serviceurl_base + "/api/book/GetBooks");
    }

    $scope.authenticateService = function () {
        doAuthenticateService();
    }
    
    $scope.addBook = function () {
        doPost(cfg.serviceurl_base + "/api/book/AddBook", '{"BookId":"10001","BookName":"Who moved my cheese?","Description":""}');
    }
    
    var doCasAuthenticate = function () {
        console.log("Extracting lt...");
                        
        $http({
            method : 'POST',
            url : cfg.casurl_base + "/login?method=POST",
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded'
            },
            transformRequest : function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            withCredentials : true,
            crossDomain : true
        }).success(function (data, status, headers, config) {

            if (status === 200) {
                
                console.log("Success first step...");
                if(data.indexOf('<h2>Log In Successful</h2>') > 0){                    
                    doPostLoginOperation();
                    return;
                }
                
                //-- Get the Login Ticket (LT) ----
                var lttext = 'name="lt" value="';
                var ltbegin = data.indexOf(lttext);
                var end = data.indexOf('"', ltbegin + lttext.length)
                var login_ticket = data.substring(ltbegin + lttext.length, end);
                console.log("lt= " + login_ticket);
                print("lt= " + login_ticket);

                //-- Get the Execution Number ----
                var execution_number = "";
                lttext = 'name="execution" value="';
                ltbegin = data.indexOf(lttext);
                end = data.indexOf('"', ltbegin + lttext.length)
                execution_number = data.substring(ltbegin + lttext.length, end);
                console.log("execution_number = " + execution_number);
                                
                console.log("CAS Logging in...");                
                $http({
                    method : 'POST',
                    url : cfg.casurl_base + "/login",
                    headers : {
                        'Content-Type' : 'application/x-www-form-urlencoded'
                    },
                    transformRequest : function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    withCredentials : true,
                    crossDomain : true,
                    data : {
                        username : cfg.username,
                        password : cfg.password,
                        _eventId : "submit",
                        lt : login_ticket,
                        gateway : "true",
                        execution : execution_number
                    }
                }).success(function (data, status, headers, config) {

                    if (status == 200) {
                        doPostLoginOperation();
                    }

                });

            }
        });
    }
    
    var doPostLoginOperation = function() {
        console.log("Login successful...");
        $scope.btn_disabled = false;
    }
    
    var doCasDeauthenticate = function () {

        $http({
            method : 'POST',
            url : cfg.casurl_base + "/logout",
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded'
            },
            transformRequest : function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            withCredentials : true,
            crossDomain : true
        }).success(function (data, status, headers, config) {

            if (status === 200) {
                console.log("Logged out from CAS");
                doPostLogoutOperation();
            }
        });
        
    }
    
    var doPostLogoutOperation = function() {
        $scope.btn_disabled = true;
    }

    var doGet = function (url_service) {

        console.log("Request: " + url_service);

        $http({
            method : 'GET',
            url : url_service,
            withCredentials : true,
            crossDomain : true
        }).success(function (data, status, headers, config) {
            console.log(data);
            // Print output
            print(data);
        }).error(function (data, status, headers, config) {
            console.log("Error:" + data);            
        });
    }

    var doPost = function (url_service, payload) {

        console.log("Request: " + url_service);

        $http({
            method : 'POST',
            url : url_service,
            headers : {
                'Content-Type' : 'application/json'
            },
            withCredentials : true,
            crossDomain : true,
            data : payload
        }).success(function (data, status, headers, config) {
            console.log("success");
            console.log(data);
            print(data);
        }).error(function (data, status, headers, config) {
            console.log("Error:" + data);            
        });
    }

    var print = function (data) {
        document.getElementById("json").innerHTML = syntaxHighlight(JSON.stringify(data, undefined, 2));
    }

});