var retailApp = angular.module('retailApp', ['ngRoute', 'ngAnimate', 'ngLodash', 'ngSanitize', '720kb.datepicker']);

// the default GA code, nothing to change
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

var fields = {
  // note: you can use a single tracking id for both the app and the website,
  // don't worry it won't mix the data. More about this in the 3rd section
  trackingId: 'UA-117459437-1'
};

// if we are in the app (the protocol will be file://)
if(document.URL.indexOf('http://') !== 0){

  // we store and provide the clientId ourselves in localstorage since there are no
  // cookies in Cordova
  fields.clientId = localStorage.getItem('ga:clientId');
  // disable GA's cookie storage functions
  fields.storage = 'none';

  ga('create', fields);

  // prevent tasks that would abort tracking
  ga('set', {
    // don't abort if the protocol is not http(s)
    checkProtocolTask: null,
    // don't expect cookies to be enabled
    checkStorageTask: null
  });

  // a callback function to get the clientId and store it ourselves
  ga(function(tracker){
    localStorage.setItem('ga:clientId', tracker.get('clientId'));
  });

  // send a screenview event
  ga('send', {
    hitType: 'screenview',
    screenName: 'Splash',
    appName: 'SPI Retail App',
    appVersion: '1.0.0'
  });
}
// if we are in a browser
else {

  ga('create', fields);

  // send a pageview event
  ga('send', {
    // this is required, there are optional properties too if you want them
    hitType: 'pageview'
  });
}


retailApp.config(function($routeProvider) {
    $routeProvider
      .when('/splash', {
        templateUrl: 'templates/splash.html',
            controller: 'splashController'
      })
      .when('/home', {
        templateUrl: 'templates/home.html',
            controller: 'homeController'
      })
      .when('/login', {
        templateUrl: 'templates/login.html',
            controller: 'loginController'
      })
      .when('/select-store', {
        templateUrl: 'templates/select-store.html',
            controller: 'selectStore'
      })
      .when('/search-inventory', {
        templateUrl: 'templates/search-inventory.html',
            controller: 'searchController'
      })
      .when('/product-detail', {
        templateUrl: 'templates/product-details.html',
            controller: 'searchController'
      })
      .when('/place-order', {
        templateUrl: 'templates/cart.html',
            controller: 'cartCheckoutController'
      })
      .when('/order-success', {
        templateUrl: 'templates/order-success.html',
        controller: 'orderSuccessController'
      })
      .when('/order-status', {
        templateUrl: 'templates/order-status.html',
            controller: 'orderStatusController'
      })
      .when('/pay-invoices', {
        templateUrl: 'templates/pay-invoices.html',
            controller: 'invoicesController'
      })
      .when('/invoices-payment', {
        templateUrl: 'templates/invoices-payment.html',
            controller: 'invoicesController'
      })
      .when('/payment-received', {
        templateUrl: 'templates/payment-received.html',
            controller: 'invoicesController'
      })
      .when('/support', {
        templateUrl: 'templates/contact.html',
            controller: 'homeController'
      })
      .when('/logout', {
        templateUrl: 'templates/login.html',
        controller: 'loginController'
      })
      .otherwise({
          templateUrl: 'templates/splash.html',
          controller: 'splashController' 
      })        
});

retailApp.config(function($httpProvider) {

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    var param = function(obj) {
        var query = '',
            name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null) query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];


});

retailApp.controller('splashController', ['$scope', '$location', '$timeout', '$rootScope', function($scope, $location, $timeout, $rootScope) {
    $rootScope.$emit('userLogout', '1');
    //localStorage.clear();
    $timeout( function(){
        $location.path('/login')
    }, 3000 );
    
}]);

retailApp.controller('topController', ['$scope', '$location', '$timeout', '$rootScope', 'Session', 'lodash', function($scope, $location, $timeout, $rootScope, Session, lodash) {

    $scope.session = false;
    $scope.active = false;
    $scope.toggle = false;
    $scope.pageLoading = true;
    $scope.disable = false;

    $scope.openMenu = function () {
      if($scope.toggle == false){
          $scope.toggle = true;
      } else {
        $scope.toggle = false;
      }
    }

    if(localStorage.getItem("sessionId") != null){
       if(localStorage.getItem("sessionId").length > 10){
        $scope.session = true;
      }
    }

    $scope.signOut = function(){
      localStorage.setItem("sessionId", "");
      $rootScope.$emit('userLogout', '1');
      $scope.toggle = false;
      $location.path('/login');
    }

    $rootScope.$on('updateSession', function(event){
        $scope.session = true;
        $timeout( function(){
              $scope.session = false;
              localStorage.setItem("sessionId","");
              $location.path('/login');
        }, 3600000 );
    });

    $rootScope.$on('updateSessionLocked', function(event){
        $scope.disable = true;
    });

    $rootScope.$on('updateSessionUnlocked', function(event){
        $scope.disable = false;
    });

    $rootScope.$on('sessionEnded', function(event){
        localStorage.setItem("store", "");
        localStorage.setItem("account", "");
        localStorage.setItem("sessionId", "");
        localStorage.setItem("tempInvoiceAmount", "");
        localStorage.setItem("invoiceIds", "");
        $scope.errorMsg = "Your session has expired. Please login again.";
        $scope.serverError = true;
        $timeout( function(){
            $scope.serverError = false;
            $location.path('/login');
        }, 3000 );
    });

    $rootScope.$on('userLogout', function(event){
        $scope.session = false;
        localStorage.setItem("store", "");
        localStorage.setItem("account", "");
        localStorage.setItem("sessionId", "");
        localStorage.setItem("tempInvoiceAmount", "");
        localStorage.setItem("invoiceIds", "");
    });

     $rootScope.$on('pageLoading', function(event){
        $scope.pageLoading = false;
    });

     $scope.scanBarcode = function(){
      $scope.toggle = false;
     cordova.plugins.barcodeScanner.scan(
        function (success) {
          if(success.cancelled != true) {
            //Send Google Anayltics Event Tracking
            ga('send', 'event', 'Scan Barcode', 'Menu', success.text);
            Session.searchInventoryUpc(success.text).then(function (response){
              if(response.toString().substring(0,5) != "error"){
                 $rootScope.product = lodash.map(response, function (obj) {
                    return lodash.transform(obj, function (result, value, key) {
                        result[key] = value;
                    });
                });
                  $location.path('/product-detail');
                 }
                else {
                  $scope.errorMsg = response;
                  $scope.serverError = true;
                  $timeout( function(){
                      $scope.serverError = false;
                  }, 5000 );
              }
            });
          }

        },
        function (result) {
            alert("We got a barcode\n" +
                  "Result: " + result.text + "\n" +
                  "Format: " + result.format + "\n" +
                  "Cancelled: ", result);
        },
        function (fail) {
            $location.path('/home');
        },
        function (error) {
            alert("Scanning failed: " + error);
        },
        {
            preferFrontCamera : false, // iOS and Android
            showFlipCameraButton : false, // iOS and Android
            showTorchButton : false, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: false, // Android, save scan history (default false)
            prompt : "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 5000, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations : true, // iOS
            disableSuccessBeep: false // iOS and Android

        }
     );
    }

       $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
        //Send Google Anayltics Screen Tracking
        ga('send', {
            hitType: 'screenview',
            screenName: $location.path().toString(),
            appName: 'SPI Retail App',
            appVersion: '1.0.0'
        });
    });


    $scope.goHome = function(){
      $location.path('/home');
    }
    
}]);

retailApp.controller('loginController', ['$scope', '$location', '$routeParams', '$http', '$timeout', '$window', 'Server', 'Session', '$rootScope', 'lodash', function($scope, $location, $routeParams, $http, $timeout, $window, Server, Session, $rootScope, lodash) {

      $rootScope.$emit('userLogout', '1');
      $scope.pageLoading = false;
      $scope.validForm = true;
      $scope.serverError = false;
      $scope.errorMsg = "";

      if(localStorage.getItem("rememberMe") == "true"){
           $scope.item = {
            username: localStorage.getItem("username"),
            password: localStorage.getItem("password"),
            rememberMe: true
          };
      }

      $scope.login = function (item) {
          if(item){
            if(item.username != null && item.password != null && item.username != "" && item.password != ""){
              $scope.validForm = true;
              $scope.pageLoading = true;
              if(item.rememberMe == true) {
                localStorage.setItem("username", item.username);
                localStorage.setItem("password", item.password);
                localStorage.setItem("rememberMe", "true");
              } else {
                localStorage.setItem("rememberMe", "false");
                localStorage.removeItem("username");
                localStorage.removeItem("password");
              }
               Session.login(item.username, item.password).then(function (response) {
                  $rootScope.$emit('userLogin', '1');
                  if(response[0]['sessionId'] != null && response[0]['sessionId'] != ""){
                      //$scope.$emit('updateSession', '1');

                          //Send Google Anayltics Event Tracking
                          ga('send', 'event', 'Account', 'Login', item.username);

                          Session.getStores(localStorage.getItem("sessionId")).then(function (response){
                             $scope.stores = lodash.map(response, function (obj) {
                                return lodash.transform(obj, function (result, value, key) {
                                    result[key] = value;
                                });
                            });
                                if($scope.stores.length > 0){
                                    $rootScope.$emit('updateSessionLocked', event);
                                    $rootScope.$emit('updateSession', event);
                                    $location.path('/select-store');
                                    $scope.selectedStore = "Select a Store";
                                } else {
                                    $rootScope.$emit('updateSession', event);
                                    $location.path('/home');
                                }
                        });
                  } else {
                    $scope.formValid = true;
                    $scope.pageLoading = false;
                    $scope.errorMsg = response;
                    $scope.serverError = true;
                    $timeout( function(){
                        $scope.serverError = false;
                    }, 5000 );
                  }
               });
           } 
           else {
                $scope.formValid = false;
                $scope.errorMsg = "Please enter a username and password.";
                $timeout( function(){
                    $scope.formValid = true;
                }, 3000 );
         }
        }else {

                $scope.formValid = false;
                $scope.errorMsg = "Please enter a username and password.";
                $timeout( function(){
                    $scope.formValid = true;
                }, 3000 );
         }
      };

    // $scope.createAlert = function(id) {
    //       $location.path('/create-alert/');
    //   }
    
}]);

retailApp.controller('homeController', ['$scope', '$location', '$routeParams', '$http', '$timeout', '$window', '$rootScope', 'Session', 'lodash', function($scope, $location, $routeParams, $http, $timeout, $window, $rootScope, Session, lodash) {

    if(localStorage.getItem("sessionId").length < 10){
        $location.path('/login');
    }  

    $scope.multipleStores = false;
    if(localStorage.getItem("store")){
        $scope.multipleStores = true;
    }     

    $scope.serverError = false;

    $scope.changeView = function(item) {
      //Send Google Anayltics Event Tracking
      ga('send', 'event', 'Home', 'Button', item);
      $location.path('/' + item);
    }

    $scope.goBack = function(){
      $window.history.back();
    }

    $scope.scanBarcode = function(){

      cordova.plugins.barcodeScanner.scan(
        function (success) {
          if(success.cancelled != true) {

            //Send Google Anayltics Event Tracking
            ga('send', 'event', 'Scan Barcode', 'Home', success.text);

            Session.searchInventoryUpc(success.text).then(function (response){
              if(response.toString().substring(0,5) != "error"){
                 $rootScope.product = lodash.map(response, function (obj) {
                    return lodash.transform(obj, function (result, value, key) {
                        result[key] = value;
                    });
                });
                  $location.path('/product-detail');
                 }
                else {
                  if(response == "error: Wrong Login,Password or SessionId"){
                    $rootScope.$emit('sessionEnded', '1'); 
                    $scope.pageLoading = false;
                  } else {
                  $location.path('/home');
                  $scope.errorMsg = response;
                  $scope.serverError = true;
                  $timeout( function(){
                      $scope.serverError = false;
                  }, 5000 );
                }
              }
            });
          }

        },
        function (result) {
            alert("We got a barcode\n" +
                  "Result: " + result.text + "\n" +
                  "Format: " + result.format + "\n" +
                  "Cancelled: ", result);
        },
        function (fail) {
            $location.path('/home');
        },
        function (error) {
            alert("Scanning failed: " + error);
        },
        {
            preferFrontCamera : false, // iOS and Android
            showFlipCameraButton : false, // iOS and Android
            showTorchButton : false, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt : "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations : true, // iOS
            disableSuccessBeep: false // iOS and Android

        }
     );
    }

    $scope.login = true;
    $scope.toggle = true;
    $scope.active = true;

}]);

retailApp.controller('searchController', ['$scope', '$location', '$routeParams', '$http', '$timeout', '$window', '$rootScope', 'Session', 'Server', 'lodash', function($scope, $location, $routeParams, $http, $timeout, $window, $rootScope, Session, Server, lodash) {
    
    if(localStorage.getItem("sessionId") == null){
         $location.path('/login');
    }

    $scope.subtotal = 0;
    $scope.success = false;
    $scope.fornValid = true;
    $scope.serverError = false;
    $scope.errorMsg = "";
    $scope.pageLoading = false;

    $scope.searchInventory = function (style,color) {

      if(style != null && color != null){
        $scope.validForm = true;
        $scope.pageLoading = true;
        Session.searchInventory(style, color).then(function (response){

            //Send Google Anayltics Event Tracking
            ga('send', 'event', 'Search Inventory', 'Item', "Style:" + style + " Color: " + color);
            if(response.toString().substring(0,5) != "error"){
             $rootScope.product = lodash.map(response, function (obj) {
                return lodash.transform(obj, function (result, value, key) {
                    result[key] = value;
                });
            });
            $location.path('/product-detail');
          } else {
            if(response == "error: Wrong Login,Password or SessionId"){
              $rootScope.$emit('sessionEnded', '1'); 
              $scope.pageLoading = false;
            } else {
            ga('send', 'event', 'Error', 'Response', response);
            $scope.formValid = true;
            $scope.errorMsg = response;
            $timeout( function(){
              $scope.pageLoading = false;
              $scope.serverError = true;
            }, 500 );
             $timeout( function(){
                  $scope.serverError = false;
              }, 5000 );
           }
          }

        });
      } else {
        $scope.formValid = false;
        $scope.errorMsg = "Please enter a style and color.";
      }
  }

  $scope.increaseQty = function(item) {
    item.unitsInCart++;
    $scope.sumCalc(item.linePrice);
  };

  $scope.decreaseQty = function(item) {
    if (item.unitsInCart > 0) {
      item.unitsInCart--;
      $scope.sumCalc(item.linePrice*-1);
    }
  };

  $scope.sumCalc = function(item) {
    $scope.subtotal += parseFloat(item);
  };

  $scope.addToCart = function(item) {

    //  angular.forEach($scope.product, function(node){ 
    //   awesomize(node)
    // });
      var tempProduct = [];
      var style = $scope.product[0].style;
      var color = $scope.product[0].color;
      var size = "";
      var qty = "";
      for (var i = 1; i < $scope.product.length; i++) {
            if($scope.product[i].unitsInCart > 0){
              // tempProduct.push({
                 size = $scope.product[i].size,
                 qty =  $scope.product[i].unitsInCart
              // });

              //Send Google Anayltics Event Tracking
              ga('send', 'event', 'Product Details', 'Add To Cart', "Style: " + style + " Color: "  + color + " Size: " + size);

              Server.addToCart(style, color, size, qty).then(function (response) {
                  $rootScope.$emit('updateCartQty', '1'); 
                      $scope.subtotal = 0.0; 
                      var inpQty = document.getElementsByClassName("qty-amount");
                      for (var i = 0; i < inpQty.length; i++) {
                          inpQty[i].value = "";
                          $scope.product[i].unitsInCart = "";
                      }
                       $scope.success = true;
                        $timeout( function(){
                            $scope.success = false;

                        }, 5000 );
             });

            }
        }
  }


  $scope.scanBarcode = function(){

     cordova.plugins.barcodeScanner.scan(
        function (success) {
          if(success.cancelled != true) {
            //Send Google Anayltics Event Tracking
            ga('send', 'event', 'Scan Barcode', 'Search Inventory', success.text);
            Session.searchInventoryUpc(success.text).then(function (response){
              if(response.toString().substring(0,5) != "error"){
                 $rootScope.product = lodash.map(response, function (obj) {
                    return lodash.transform(obj, function (result, value, key) {
                        result[key] = value;
                    });
                });
                  $location.path('/product-detail');
                 }
                else {
                  $scope.errorMsg = response;
                  $scope.formValid = true;
                  $scope.serverError = true;
                  $timeout( function(){
                      $scope.serverError = false;
                  }, 5000 );
              }
            });
          }

        },
        function (result) {
            alert("We got a barcode\n" +
                  "Result: " + result.text + "\n" +
                  "Format: " + result.format + "\n" +
                  "Cancelled: ", result);
        },
        function (fail) {
            $location.path('/home');
        },
        function (error) {
            alert("Scanning failed: " + error);
        },
        {
            preferFrontCamera : false, // iOS and Android
            showFlipCameraButton : false, // iOS and Android
            showTorchButton : false, // iOS and Android
            torchOn: false, // Android, launch with the torch switched on (if available)
            saveHistory: true, // Android, save scan history (default false)
            prompt : "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations : true, // iOS
            disableSuccessBeep: false // iOS and Android

        }
     );

  }

}]);

retailApp.controller('cartController', ['$scope', '$location', '$routeParams', '$http', '$timeout', '$window', '$rootScope', 'Session', 'Server', 'lodash', '$rootScope', function($scope, $location, $routeParams, $http, $timeout, $window, $rootScope, Session, Server, lodash, $rootScope) {
    
      var sessionId = localStorage.getItem("sessionId");
      $scope.cartQty = 0;
      Session.getCart(sessionId).then(function (response){
           $scope.cartQty = response;
           localStorage.setItem("cartQty", $scope.cartQty);
      });   

      $rootScope.$on('updateCartQty', function(event){
          Session.getCart(sessionId).then(function (response){     
             $timeout( function(){
                    $scope.cartChange = true;
                    $scope.cartQty = response;
                    localStorage.setItem("cartQty", $scope.cartQty);
                }, 1000 );
                $timeout( function(){
                    $scope.cartChange = false;
                }, 2000 );
          });   
      });

      $scope.viewCart = function (){
        $location.path('/place-order');
      }

}]);

retailApp.controller('cartCheckoutController', ['$scope', '$location', '$routeParams', '$http', '$timeout', '$window', '$rootScope', 'Session', 'Server', 'lodash', function($scope, $location, $routeParams, $http, $timeout, $window, $rootScope, Session, Server, lodash) {
    
    $scope.pageLoading = true;
    $scope.validForm = true;
    $scope.tempStartDate = new Date(Date.now()).toLocaleString();
    $scope.showTermsStatus = false;

    $scope.showTerms = function() {
      window.scrollTo(0, 0);
      $scope.showTermsStatus = true;
    }

    $scope.closeTerms = function(){
      $scope.showTermsStatus = false;
    }


    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 

    $scope.tempStartDate  = mm+'/'+dd+'/'+yyyy;
    

    var sessionId = localStorage.getItem("sessionId");

    if(localStorage.getItem("sessionId") == null){
         $location.path('/login');
    }

    //Disable Dropship By Default
    $scope.noDropship = false;
    $scope.hideDropship = true;
    $scope.orderTotal = 0.0;

    // $scope.states = ['Select State','Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

    Session.getCartItems(sessionId).then(function (response){
      if(response.toString().substring(0,5) != "error"){
        $scope.cartItems = lodash.map(response, function (obj) {
            return lodash.transform(obj, function (result, value, key) {
                result[key] = value;
            });
        });
      } else {
        if(response == "error: Wrong Login,Password or SessionId"){
              $rootScope.$emit('sessionEnded', '1'); 
              $scope.pageLoading = false;
            } else {
              $scope.errorMsg = response;
              $scope.validForm = false;
              $timeout( function(){$scope.validForm = true;}, 3000 );
            }
      }

        for(var i = 0; i < $scope.cartItems.length; i++) {
          $scope.orderTotal += $scope.cartItems[i].qty * $scope.cartItems[i].price;
        }

        localStorage.setItem("orderTotal", $scope.orderTotal);

        Session.getShippingOptions(sessionId).then(function (response){
          $scope.shippingOptions = lodash.map(response, function (obj) {
            return lodash.transform(obj, function (result, value, key) {
                result[key] = value;
            });
        });

        //$scope.defaultShipping = $scope.shippingOptions[0];
        //$scope.defaultShippingValue = $scope.shippingOptions;
         $timeout( function(){ 
            $scope.pageLoading = false;
            $scope.disabledDates = ['2018/04/22','2018/04/24'];
          }, 500 );
        
      });

    });   

    $scope.removeCartItem = function(item){

      //Send Google Anayltics Event Tracking
      ga('send', 'event', 'Cart', 'Remove Item', "Style: " + item.style + " Color:" + item.color + " Size:" + item.size);

      Server.removeCartItem(item.style, item.color, item.size).then(function (response){
          if(response == "ok"){
               var index = $scope.cartItems.indexOf(item);
                $scope.cartItems.splice(index, 1);
                $rootScope.$emit('updateCartQty', '1');  
          }
      });

    }

    $scope.toggleDropship = function(item) {

      if(item == true) {
        $scope.noDropship = false;
        $scope.hideDropship = false;
      } else {
        $scope.noDropship = true;
        $scope.hideDropship = true;
      }

    }

    $scope.submitOrder = function(item) {

      var purchaseOrder = "";
      var dropship = "no";
      var contactName = "";
      var address1 = "";
      var address2 = "";
      var city = "";
      var state = "";
      var zip = "";
      var shipVia = "";
      var promoCode = "";
      var cancelBackorder = "";
      var shipComplete = "";
      var startDate = $scope.tempStartDate;

      
      if(item){
        
        //Dropship Order 
        if(item.dropship){
            dropship = "yes";
            localStorage.setItem("dropship", "");
           if(item.name) {
            contactName = item.name;
            localStorage.setItem("contactName", contactName);
           } else {
            $scope.errorMsg = "Error: Please enter a name.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
           }
           if(item.address1) {
            address1 = item.address1;
            localStorage.setItem("address1", address1);
           } else {
            $scope.errorMsg = "Error: Please enter an address.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
           }
           if(item.city) {
            city = item.city;
            localStorage.setItem("city", city);
           } else {
            $scope.errorMsg = "Error: Please enter a city.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
           }
           if(item.state) {
            state = item.state;
            localStorage.setItem("state", state);
           } else {
            $scope.errorMsg = "Error: Please select a state.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
           }
           if(item.zip){
            var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(item.zip);
            if(isValidZip){
              zip =  item.zip;
              localStorage.setItem("zip", zip);
              } else {
                $scope.errorMsg = "Error: Please enter a valid zip code.";
                $scope.validForm = false;
                $timeout( function(){$scope.validForm = true;}, 3000 );
                return;
              }
            } else {
              $scope.errorMsg = "Error: Please enter a valid zip code.";
              $scope.validForm = false;
              $timeout( function(){$scope.validForm = true;}, 3000 );
              return;
            }
        } 

        if(item.promoCode){
          promoCode = item.promoCode;
        }
        if(item.cancelBackorder){
          cancelBackorder = item.cancelBackorder;
        }
        if(item.shipComplete){
          shipComplete = item.shipComplete;
        }

        //Purchase Order Number
        if(item.purchaseOrder){
          if(item.purchaseOrder.length == 25) {
              purchaseOrder = item.purchaseOrder;
          } else {
              $scope.errorMsg = "Error: Please enter a valid purchase order number.";
              $scope.validForm = false;
              $timeout( function(){$scope.validForm = true;}, 3000 );
              return;
          } 
        }

        //Start Date 
         if(item.startDate){
            if(item.startDate >= $scope.tempStartDate){
              startDate = item.startDate;
            } else {
                $scope.errorMsg = "Error: Start date can't be in the past.";
                $scope.validForm = false;
                $timeout( function(){$scope.validForm = true;}, 3000 );
                return;
            }
          }

        //Shipping Method 
        if(item.shipVia){
          shipVia = item.shipVia;
        } else {
          $scope.errorMsg = "Error: Please select a shipping method.";
          $scope.validForm = false;
          $timeout( function(){$scope.validForm = true;}, 3000 );      
          return;    
        }

        //Terms & Conditions 
        if(!item.termsAgree){
          $scope.errorMsg = "Error: You must agree to the Terms & Conditions.";
          $scope.validForm = false;
          $timeout( function(){$scope.validForm = true;}, 3000 );      
          return;  
        }

      } else {
        $scope.errorMsg = "Error: Please select a shipping method.";
        $scope.validForm = false;
        $timeout( function(){$scope.validForm = true;}, 3000 ); 
        return;
      }

      $scope.pageLoading = true;
      localStorage.setItem("shipVia", item.shipVia);
      console.log('Start date:' + item.startDate);

      Server.submitOrder(shipVia, purchaseOrder, dropship, contactName, address1, address2, city, state, zip, promoCode, startDate, cancelBackorder, shipComplete).then(function (response){
            //Send Google Anayltics Event Tracking
            var tempResponse = response.substring(0,2);
            if(tempResponse == "SO"){
                $scope.orderDetails = response;
                ga('send', 'event', 'Cart', 'Place Order', $scope.orderDetails);
                localStorage.setItem("salesOrderNumber", $scope.orderDetails);
                $location.path('/order-success');
              } else {

              }
      });

    }


   $scope.defaults = [
    {
        val: "1",
        name: "Yes"
    },
    {
        val: "0",
        name: "No"
    }
    ];


   $scope.states = [
    {
        name: "Alabama",
        abbreviation: "AL"
    },
    {
        name: "Alaska",
        abbreviation: "AK"
    },
    {
        name: "American Samoa",
        abbreviation: "AS"
    },
    {
        name: "Arizona",
        abbreviation: "AZ"
    },
    {
        name: "Arkansas",
        abbreviation: "AR"
    },
    {
        name: "California",
        abbreviation: "CA"
    },
    {
        name: "Colorado",
        abbreviation: "CO"
    },
    {
        name: "Connecticut",
        abbreviation: "CT"
    },
    {
        name: "Delaware",
        abbreviation: "DE"
    },

    {
        name: "Florida",
        abbreviation: "FL"
    },
    {
        name: "Georgia",
        abbreviation: "GA"
    },
    {
        name: "Hawaii",
        abbreviation: "HI"
    },
    {
        name: "Idaho",
        abbreviation: "ID"
    },
    {
        name: "Illinois",
        abbreviation: "IL"
    },
    {
        name: "Indiana",
        abbreviation: "IN"
    },
    {
        name: "Iowa",
        abbreviation: "IA"
    },
    {
        name: "Kansas",
        abbreviation: "KS"
    },
    {
        name: "Kentucky",
        abbreviation: "KY"
    },
    {
        name: "Louisiana",
        abbreviation: "LA"
    },
    {
        name: "Maine",
        abbreviation: "ME"
    },
    {
        name: "Maryland",
        abbreviation: "MD"
    },
    {
        name: "Massachusetts",
        abbreviation: "MA"
    },
    {
        name: "Michigan",
        abbreviation: "MI"
    },
    {
        name: "Minnesota",
        abbreviation: "MN"
    },
    {
        name: "Mississippi",
        abbreviation: "MS"
    },
    {
        name: "Missouri",
        abbreviation: "MO"
    },
    {
        name: "Montana",
        abbreviation: "MT"
    },
    {
        name: "Nebraska",
        abbreviation: "NE"
    },
    {
        name: "Nevada",
        abbreviation: "NV"
    },
    {
        name: "New Hampshire",
        "abbreviation": "NH"
    },
    {
        name: "New Jersey",
        "abbreviation": "NJ"
    },
    {
        name: "New Mexico",
        "abbreviation": "NM"
    },
    {
        name: "New York",
        "abbreviation": "NY"
    },
    {
        name: "North Carolina",
        "abbreviation": "NC"
    },
    {
        name: "North Dakota",
        "abbreviation": "ND"
    },
    {
        name: "Ohio",
        "abbreviation": "OH"
    },
    {
        name: "Oklahoma",
        "abbreviation": "OK"
    },
    {
        name: "Oregon",
        "abbreviation": "OR"
    },
    {
        name: "Pennsylvania",
        abbreviation: "PA"
    },
    {
        name: "Rhode Island",
        abbreviation: "RI"
    },
    {
        name: "South Carolina",
        abbreviation: "SC"
    },
    {
        name: "South Dakota",
        abbreviation: "SD"
    },
    {
        name: "Tennessee",
        abbreviation: "TN"
    },
    {
        name: "Texas",
        abbreviation: "TX"
    },
    {
        name: "Utah",
        abbreviation: "UT"
    },
    {
        name: "Vermont",
        abbreviation: "VT"
    },
    {
        name: "Virginia",
        abbreviation: "VA"
    },
    {
        name: "Washington",
        abbreviation: "WA"
    },
    {
        name: "West Virginia",
        abbreviation: "WV"
    },
    {
        name: "Wisconsin",
        abbreviation: "WI"
    },
    {
        name: "Wyoming",
        abbreviation: "WY"
    }
];

}]);


retailApp.controller('orderSuccessController', ['$scope', '$location', '$timeout', function($scope, $location, $timeout) {

    $scope.dropship = false;
    if(localStorage.getItem("dropship") != null){
      $scope.dropship = true;
      $scope.contactName = localStorage.getItem("contactName");
      $scope.address1 = localStorage.getItem("address1");
      if(localStorage.getItem("address2")){
        $scope.address2 = localStorage.getItem("address2");
      }
      $scope.city = localStorage.getItem("city");
      $scope.state = localStorage.getItem("state");
      $scope.zip = localStorage.getItem("zip");
    }

    $scope.salesOrderNumber = localStorage.getItem("salesOrderNumber");
    $scope.orderTotal = localStorage.getItem("orderTotal");
    $scope.orderQty = localStorage.getItem("cartQty");
    $scope.shipVia = localStorage.getItem("shipVia");

    $scope.goHome = function(){
      $location.path('/home');
    }

}]);

retailApp.controller('orderStatusController', ['$scope', '$location', '$routeParams', '$http', '$timeout', '$window', '$rootScope', 'Session', 'Server', 'lodash', function($scope, $location, $routeParams, $http, $timeout, $window, $rootScope, Session, Server, lodash) {
    
      
      $scope.serverError = false;
      $scope.errorMsg = "";
      $scope.pageLoading = true;
      $scope.searchLoading = false;
      var sessionId = localStorage.getItem("sessionId");


      $scope.searchOrders = function(item){
        $scope.searchLoading = true;
          Session.getOrdersSearch(sessionId, item).then(function (response){
            if(response == "Session Expired"){
              $scope.searchLoading = false;
              $scope.errorMsg = "Session has expired. Please login again.";
              $scope.serverError = true;
              $timeout( function(){ $location.path('/login');}, 3000 );
            } else {
              $scope.orders = lodash.map(response, function (obj) {
                  return lodash.transform(obj, function (result, value, key) {
                      result[key] = value;
                  });
              });
              $scope.searchLoading = false;
            }
        }); 
      }

      Session.getOrders(sessionId).then(function (response){

        if(response == "Session Expired"){
          $scope.pageLoading = false;
          $scope.errorMsg = "Session has expired. Please login again.";
          $scope.serverError = true;
          $timeout( function(){ $location.path('/login');}, 3000 );
        } else {
          $scope.orders = lodash.map(response, function (obj) {
              return lodash.transform(obj, function (result, value, key) {
                  result[key] = value;
              });
          });

          $scope.pageLoading = false;
        }

      });   

}]);

retailApp.controller('invoicesController', ['$scope', '$location', '$routeParams', '$http', '$timeout', '$window', '$rootScope', 'Session', 'Server', 'lodash', '$filter', function($scope, $location, $routeParams, $http, $timeout, $window, $rootScope, Session, Server, lodash, $filter) {
    
      

      //Check For Session
      if(localStorage.getItem("sessionId") == null){
           $location.path('/login');
      }

      //Controller Variables
      $scope.pageLoading = true;
      $scope.validForm = true;
      $scope.paymentSuccess = false;
      $scope.allToggled = false;
      $scope.formLoading = false;

      //Transfer Invoice Amount to Payment Form
      if(localStorage.getItem("invoiceAmount")){
        $scope.invoiceAmount = parseFloat(localStorage.getItem("invoiceAmount"));
        $scope.invoiceIds = localStorage.getItem("invoiceIds");
      } else {
          $scope.invoiceAmount = 0.0;
          $scope.invoiceIds = "";
      }

      if(localStorage.getItem("tempInvoiceAmount")){
        $scope.tempInvoiceAmount = parseFloat(localStorage.getItem("tempInvoiceAmount"));
      } else {
        $scope.tempInvoiceAmount = 0.0;
      }

      if(localStorage.getItem("confirmationNumber")){
        $scope.confNumber = localStorage.getItem("confirmationNumber");
        $scope.paymentSuccess = true;
      }

      $scope.message = "";
      $scope.toggledAll = false;
      var chks = document.getElementsByClassName("chkbox");
      var masterChk = document.getElementsByClassName("m-chkbox");
      var sessionId = localStorage.getItem("sessionId");
      //$scope.states = ['Select State','Alabama','Alaska','American Samoa','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Palau','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Island','Virginia','Washington','West Virginia','Wisconsin','Wyoming']
      $scope.selectedState = "";

      Session.getInvoices(sessionId).then(function (response){
            if(response == "error: Wrong Login,Password or SessionId"){
              $rootScope.$emit('sessionEnded', '1'); 
              $scope.pageLoading = false;
            } else {
            $scope.invoices = lodash.map(response, function (obj) {
                return lodash.transform(obj, function (result, value, key) {
                    result[key] = value;
                });
            });

              if(localStorage.getItem("invoiceIds")){
                var tempInvoices = JSON.parse(localStorage.getItem("invoiceIds"));
                var invoiceArray = tempInvoices.split(",");
                var item, items = [];
                for (var i = 0; i < invoiceArray.length; i++) {
                    item = {};
                    item.invoice = invoiceArray[i];
                    items.push(item);
                }
              }
               $timeout( function(){
                  $scope.pageLoading = false;
                }, 500 );

               $timeout( function(){
                      for(var i = 0; i < chks.length; i++) {
                          angular.forEach(items, function(value1, key1) {
                            if (("i-" + value1.invoice) === chks[i].id) {
                                chks[i].checked = true;
                              }
                          });
                      }
               }, 1000);
         }
      }); 

      $scope.payInvoices = function(amount) {
        if(amount > 0) {
          $scope.tempInvoiceAmount = $filter('currency')(amount);
          $scope.tempInvoiceAmount = $scope.tempInvoiceAmount.replace(",", "");
          $scope.tempInvoiceAmount = $scope.tempInvoiceAmount.replace("$", "");

          localStorage.setItem("invoiceAmount", $scope.tempInvoiceAmount);
          localStorage.setItem("tempInvoiceAmount", $scope.tempInvoiceAmount);
          localStorage.setItem("invoiceIds", "");
          $scope.invoiceIds = "";

          for(var i = 0; i < chks.length; i++) {
              if(chks[i].checked == true){
                $scope.invoiceIds += $scope.invoices[i].invoice + ",";
              }
          }
          $scope.invoiceIds = $scope.invoiceIds.slice(0, -1);
          localStorage.setItem("invoiceIds", JSON.stringify($scope.invoiceIds));
          ga('send', 'event', 'Invoices', 'Pay Invoice', 'Amount: ' + $scope.tempInvoiceAmount);
          $location.path('/invoices-payment');
        } else {
          $scope.errorMsg = "Please select the invoices you would like to pay.";
          $scope.validForm = false;
          $timeout( function(){ $scope.validForm = true;}, 3000 );
        }

      }

      $scope.submitPayment = function(item, selectedState){

          var accountNumber = "";
          var routingNumber = "";
          var businessName = "";
          var cardName = "";
          var cardNumber = "";
          var cardExp = "";
          var cardCsv = "";
          var address2 = "";

          if(item){
           if(item.address1) {
            address1 = item.address1;
            localStorage.setItem("address1", address1);
           } else {
            $scope.errorMsg = "Error: Please enter an address.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
           }
           if(item.city) {
            city = item.city;
            localStorage.setItem("city", city);
           } else {
            $scope.errorMsg = "Error: Please enter a city.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
           }
           if(item.state) {
            state = item.state;
            localStorage.setItem("state", state);
           } else {
            $scope.errorMsg = "Error: Please select a state.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
           }
           if(item.address2){
            address2 = item.address2;
           }
           if(item.zip){
            var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(item.zip);
            if(isValidZip){
              zip =  item.zip;
              localStorage.setItem("zip", zip);
              } else {
                $scope.errorMsg = "Error: Please enter a valid zip code.";
                $scope.validForm = false;
                $timeout( function(){$scope.validForm = true;}, 3000 );
                return;
              }
            } else {
              $scope.errorMsg = "Error: Please enter a valid zip code.";
              $scope.validForm = false;
              $timeout( function(){$scope.validForm = true;}, 3000 );
              return;
            }
        } else {
            $scope.errorMsg = "Error: Please enter an address.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
        }

         if(item.routingNumber == null && item.cardName == null){
            $scope.errorMsg = "Error: Please enter a payment method.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
        }

        if(item.routingNumber){

          routingNumber = item.routingNumber;

          if(item.accountNumber) {
            accountNumber = item.accountNumber;
          } else {
            $scope.errorMsg = "Error: Please enter an account number.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
          }

          if(item.businessName){
            businessName = item.businessName;
          } else {
            $scope.errorMsg = "Error: Please enter a name for the check.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
          }

          if(item.checkAgree) {

          } else {
            $scope.errorMsg = "Error: You must agree to the conditions.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
          }
        }

        if(item.cardName){
          cardName = item.cardName;
          if(item.cardNumber){
            cardNumber = item.cardNumber;
          } else {
            $scope.errorMsg = "Error: Please enter a card number.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
          }

          if(item.expDate){
            cardExp = item.expDate;
          }else {
            $scope.errorMsg = "Error: Please enter an expiration date.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
          }

          if(item.csv){
            cardCsv = item.csv;
          } else {
            $scope.errorMsg = "Error: Please enter the csv.";
            $scope.validForm = false;
            $timeout( function(){$scope.validForm = true;}, 3000 );
            return;
          }

        }
          $scope.formLoading = true;
          Server.payInvoice($scope.invoiceIds, $scope.invoiceAmount, item.address1, address2, item.city, item.state, item.zip, cardName, cardNumber, cardExp, cardCsv, $scope.invoices[0].batchId, routingNumber, accountNumber, businessName).then(function (response){
            $scope.confirmationNumber = lodash.map(response, function (obj) {
              return lodash.transform(obj, function (result, value, key) {
                  result[key] = value;
              });

              //Send Google Anayltics Event Tracking
              ga('send', 'event', 'Invoices', 'Submit Payment', 'Amount: ' + $scope.tempInvoiceAmount);
              $scope.formLoading = false;

          });
            if($scope.confirmationNumber.length > 0){
            if($scope.confirmationNumber[0].success == 1){
              $scope.formLoading = false;
              localStorage.setItem("confirmationNumber", $scope.confirmationNumber[0].confirmationNumber);
              $location.path('/payment-received');
            } else {
              $timeout( function(){
                $scope.errorMsg = $scope.confirmationNumber[0].confirmationNumber;
                $scope.validForm = false;
                $scope.formLoading = false;
              },1000 );
              $timeout( function(){$scope.validForm = true;}, 7000 );
            }
          } else {
               $timeout( function(){
                $scope.errorMsg = "Sorry, looks like something went wrong. Please try again.";
                $scope.validForm = false;
                $scope.formLoading = false;
              },1000 );
              $timeout( function(){$scope.validForm = true;}, 7000 );
          }
        });
      }

      $scope.toggleAll = function () {

        if ($scope.toggledAll == false) {
            $scope.toggledAll = true;
            $scope.tempInvoiceAmount = 0.0;
            for (var i = 0; i < chks.length; i++) {
                chks[i].checked = true;
                $scope.sumCalc($scope.invoices[i].amount);
            }
        } else {
            $scope.toggledAll = false;
            for (var i = 0; i < chks.length; i++) {
                chks[i].checked = false;
                $scope.tempInvoiceAmount = 0.0;
            }
        }

    }

  $scope.goHome = function(){
    $location.path('/home');
  }

  $scope.sumCalc = function(item) {
    $scope.tempInvoiceAmount += parseFloat(item);
  };

  $scope.addInvoice = function(item, event) {
    if(event.toElement.checked == true){
      $scope.tempInvoiceAmount += parseFloat(item.amount);
    } else {
      $scope.tempInvoiceAmount -= parseFloat(item.amount);
    }
  };

  // $scope.addInvoiceBox = function(item,event){

  //       for(var i = 0; i < chks.length; i++) {
  //           if (("i-" + item.invoice) === chks[i].id) {
  //                 chks[i].checked = true;
  //           }
  //       }
  // }

  $scope.goBack = function(){
    localStorage.setItem("tempInvoiceAmount", $scope.tempInvoiceAmount);
    $window.history.back();
    $scope.tempInvoiceAmount = parseFloat(localStorage.getItem("invoiceAmount"));
  }

   $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
      if($location.path().toString() != "/pay-invoices" && $location.path().toString() != "/invoices-payment"){
        localStorage.removeItem("tempInvoiceAmount");
        localStorage.removeItem("invoiceAmount");
        localStorage.removeItem("invoiceIds");
      }
      window.scrollTo(0, 0);
    });

      $scope.states = [
    {
        name: "Alabama",
        abbreviation: "AL"
    },
    {
        name: "Alaska",
        abbreviation: "AK"
    },
    {
        name: "American Samoa",
        abbreviation: "AS"
    },
    {
        name: "Arizona",
        abbreviation: "AZ"
    },
    {
        name: "Arkansas",
        abbreviation: "AR"
    },
    {
        name: "California",
        abbreviation: "CA"
    },
    {
        name: "Colorado",
        abbreviation: "CO"
    },
    {
        name: "Connecticut",
        abbreviation: "CT"
    },
    {
        name: "Delaware",
        abbreviation: "DE"
    },

    {
        name: "Florida",
        abbreviation: "FL"
    },
    {
        name: "Georgia",
        abbreviation: "GA"
    },
    {
        name: "Hawaii",
        abbreviation: "HI"
    },
    {
        name: "Idaho",
        abbreviation: "ID"
    },
    {
        name: "Illinois",
        abbreviation: "IL"
    },
    {
        name: "Indiana",
        abbreviation: "IN"
    },
    {
        name: "Iowa",
        abbreviation: "IA"
    },
    {
        name: "Kansas",
        abbreviation: "KS"
    },
    {
        name: "Kentucky",
        abbreviation: "KY"
    },
    {
        name: "Louisiana",
        abbreviation: "LA"
    },
    {
        name: "Maine",
        abbreviation: "ME"
    },
    {
        name: "Maryland",
        abbreviation: "MD"
    },
    {
        name: "Massachusetts",
        abbreviation: "MA"
    },
    {
        name: "Michigan",
        abbreviation: "MI"
    },
    {
        name: "Minnesota",
        abbreviation: "MN"
    },
    {
        name: "Mississippi",
        abbreviation: "MS"
    },
    {
        name: "Missouri",
        abbreviation: "MO"
    },
    {
        name: "Montana",
        abbreviation: "MT"
    },
    {
        name: "Nebraska",
        abbreviation: "NE"
    },
    {
        name: "Nevada",
        abbreviation: "NV"
    },
    {
        name: "New Hampshire",
        "abbreviation": "NH"
    },
    {
        name: "New Jersey",
        "abbreviation": "NJ"
    },
    {
        name: "New Mexico",
        "abbreviation": "NM"
    },
    {
        name: "New York",
        "abbreviation": "NY"
    },
    {
        name: "North Carolina",
        "abbreviation": "NC"
    },
    {
        name: "North Dakota",
        "abbreviation": "ND"
    },
    {
        name: "Ohio",
        "abbreviation": "OH"
    },
    {
        name: "Oklahoma",
        "abbreviation": "OK"
    },
    {
        name: "Oregon",
        "abbreviation": "OR"
    },
    {
        name: "Pennsylvania",
        abbreviation: "PA"
    },
    {
        name: "Rhode Island",
        abbreviation: "RI"
    },
    {
        name: "South Carolina",
        abbreviation: "SC"
    },
    {
        name: "South Dakota",
        abbreviation: "SD"
    },
    {
        name: "Tennessee",
        abbreviation: "TN"
    },
    {
        name: "Texas",
        abbreviation: "TX"
    },
    {
        name: "Utah",
        abbreviation: "UT"
    },
    {
        name: "Vermont",
        abbreviation: "VT"
    },
    {
        name: "Virginia",
        abbreviation: "VA"
    },
    {
        name: "Washington",
        abbreviation: "WA"
    },
    {
        name: "West Virginia",
        abbreviation: "WV"
    },
    {
        name: "Wisconsin",
        abbreviation: "WI"
    },
    {
        name: "Wyoming",
        abbreviation: "WY"
    }
];

}]);

retailApp.controller('selectStore', ['$scope', '$location', '$routeParams', '$http', '$timeout', '$window', '$rootScope', 'Session', 'lodash', '$sce', function($scope, $location, $routeParams, $http, $timeout, $window, $rootScope, Session, lodash, $sce) {
    
    //if(localStorage.getItem("sessionId") == null){
    //      $location.path('/login');
    //}
    $scope.serverError = false;
    $scope.pageLoading = true;
    $scope.errorMsg = "Error: Please select a store.";

    Session.getStores(localStorage.getItem("sessionId")).then(function (response){
         $scope.stores = lodash.map(response, function (obj) {
            return lodash.transform(obj, function (result, value, key) {
                result[key] = $sce.trustAsHtml(value);
            });
        });

         $scope.pageLoading = false;
    });

    $scope.selectStore = function(store){
      if(store != null){
        if(store == "No Store"){
          localStorage.setItem("store", "");
        } else {
          localStorage.setItem("store", store);
        }
        $rootScope.$emit('updateSession', event);
        $rootScope.$emit('updateSessionUnlocked', event);
        $rootScope.$emit('updateCartQty', '1'); 
        ga('send', 'event', 'Select Store', 'Store', store);
        $location.path('/home');
      } else {
        $scope.serverError = true;
       $timeout( function(){
            $scope.serverError = false;
        }, 5000 );
      }
    }

    $scope.login = true;
    $scope.toggle = true;
    $scope.active = true;

}]);

retailApp.controller('navController', ['$scope', '$location', '$routeParams', '$http', '$timeout', '$window', '$rootScope', 'Session', function($scope, $location, $routeParams, $http, $timeout, $window, $rootScope, Session) {

       $scope.signOut = function () {
          localStorage.setItem("sessionId", "");
          $rootScope.$emit('userLogout', '1');
          $scope.toggle = false;
          localStorage.clear();
          $location.path('/login');
       }

}]);


retailApp.directive('brandLogo', function () {
  return {
      restrict: 'E',
      templateUrl: 'templates/brand-logo.html'
  };
})

retailApp.directive('introLogo', function () {
  return {
      restrict: 'E',
      templateUrl: 'templates/intro-logo.html'
  };
})

retailApp.directive('navigation', function () {
  return {
      restrict: 'E',
      templateUrl: 'templates/navigation.html'
  };
})

retailApp.directive('successIcon', function () {
  return {
      restrict: 'E',
      templateUrl: 'templates/success-icon.html'
  };
})

retailApp.directive('errorIcon', function () {
  return {
      restrict: 'E',
      templateUrl: 'templates/error-icon.html'
  };
})

retailApp.directive('pageLoader', function () {
  return {
      restrict: 'E',
      templateUrl: 'templates/page-loader.html'
  };
})

retailApp.directive('datePicker', function ($timeout) {
  return {
    template: '<div class="datepicker" date-format="MM/dd/yyyy"' +
                'date-set="{{tempStartDate}}">' +
                // 'date-disabled-dates="{{ disabledDates }}">' +
                '<input type="text" id="date-change-picker"   readonly="readonly"' +
                'ng-model="item.startDate" ' +
                'placeholder="Start Date:" />' +
              '</div>',
    restrict: 'E',
    link: function(scope,element, attrs){
      $timeout(function() {
        element.removeAttr("tabindex");
      })
    }
  };
})

retailApp.directive('uppercase', function () {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function(input) {
                return input ? input.toUpperCase() : "";
            });
            element.css("text-transform","uppercase");
        }
    };
})
retailApp.directive('decimals', function () {
    return {
        restrict: "A", // Only usable as an attribute of another HTML element
        require: "?ngModel",
        scope: {
            decimals: "@",
            decimalPoint: "@"
        },
        link: function (scope, element, attr, ngModel) {
            var decimalCount = parseInt(scope.decimals) || 2;
            var decimalPoint = ".";

            // Run when the model is first rendered and when the model is changed from code
            ngModel.$render = function() {
                if (ngModel.$modelValue != null && ngModel.$modelValue >= 0) {
                    if (typeof decimalCount === "number") {
                        element.val(ngModel.$modelValue.toFixed(decimalCount).toString().replace(",", "."));
                    } else {
                        element.val(ngModel.$modelValue.toString().replace(",", "."));
                    }
                }
            }

            // Run when the view value changes - after each keypress
            // The returned value is then written to the model
            ngModel.$parsers.unshift(function(newValue) {
                if (typeof decimalCount === "number") {
                    var floatValue = parseFloat(newValue.replace(",", "."));
                    if (decimalCount === 0) {
                        return parseInt(floatValue);
                    }
                    return parseFloat(floatValue.toFixed(decimalCount));
                }
                
                return parseFloat(newValue.replace(",", "."));
            });

            // Formats the displayed value when the input field loses focus
            element.on("change", function(e) {
                var floatValue = parseFloat(element.val().replace(",", "."));
                if (!isNaN(floatValue) && typeof decimalCount === "number") {
                    if (decimalCount === 0) {
                        element.val(parseInt(floatValue));
                    } else {
                        var strValue = floatValue.toFixed(decimalCount);
                        element.val(strValue.replace(".", decimalPoint));
                    }
                }
            });
        }
    }
})



retailApp.factory('Server', ['$http', function ServerFactory($http) {

      function login(username, password) {
        var applicationName = "SPI_APP";
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/Login',
              data: '{"Columns":[{"Name": "Username","Type":"String"},{"Name":"Password","Type": "String"},{"Name":"SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"},{"Name":"UDID","Type":"String"},{"Name":"Version","Type":"String"}],"Rows":[["' + username + '","' + password + '","","' + applicationName + '","",""]]}',
              method: 'POST'
          }).then(
               function successFn(response) {
                   return response.data;
               },
               function errorFn(response) {
                   return "Error: " + response.data;
               }
           );
      }
      function getStores(sessionId) {
        var applicationName = "SPI_APP";
        var sessionId = localStorage.getItem("sessionId");
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/GetStores',
              data: '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"}],"Rows":[["' + sessionId + '","' + applicationName + '"]]}',
              method: 'POST'
          }).then(
               function successFn(response) {
                   return response.data;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }
      function searchInventory(style, color) {
        var applicationName = "SPI_APP";
        var sessionId = localStorage.getItem("sessionId");
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/GetProductData',
              data: '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"},{"Name":"Style","Type":"String"}, {"Name":"Color","Type":"String"}],"Rows":[["' + sessionId + '","' + applicationName + '","' + style.toUpperCase() + '","' + color + '"]]}',
              method: 'POST'
          }).then(
               function successFn(response) {
                   return response.data;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }

      function searchInventoryUpc(upc) {
        var applicationName = "SPI_APP";
        var sessionId = localStorage.getItem("sessionId");
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/GetProductData',
              data: '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"},{"Name":"UPC","Type":"String"}],"Rows":[["' + sessionId + '","' + applicationName + '","' + upc + '"]]}',
              method: 'POST'
          }).then(
               function successFn(response) {
                   return response.data;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }

      function getCart(sessionId) {
        var applicationName = "SPI_APP";
        var sessionId = localStorage.getItem("sessionId");
        var store = "";
        var accountId = "";
        if(localStorage.getItem("store")){
          store = localStorage.getItem("store");
        }
        if(localStorage.getItem("account")){
          accountId = localStorage.getItem("account");
        }
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/GetShoppingCart',
              data: '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"},{"Name":"Account","Type":"String"},{"Name":"Store","Type":"String"}],"Rows":[["' + sessionId + '","' + applicationName + '","' + accountId + '","' + store +'"]]}',
              method: 'POST'
          }).then(
               function successFn(response) {
                   return response.data;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }

      function getOrders(sessionId) {
        var applicationName = "SPI_APP";
        var sessionId = localStorage.getItem("sessionId");
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/CheckOrderStatus',
              data: '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"}],"Rows":[["' + sessionId + '","' + applicationName + '"]]}',
              method: 'POST'
          }).then(
               function successFn(response) {
                   return response.data;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }

      function getOrdersSearch(sessionId, searchValue) {
        var applicationName = "SPI_APP";
        var data = '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"},{"Name":"SearchValue","Type":"String"}],"Rows":[["' + sessionId + '","' + applicationName + '","' + searchValue + '"]]}';
        var sessionId = localStorage.getItem("sessionId");
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/CheckOrderStatus',
              data: data,
              method: 'POST'
          }).then(
               function successFn(response) {
                   return response.data;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }

      function getInvoices(sessionId) {
        var applicationName = "SPI_APP";
        var sessionId = localStorage.getItem("sessionId");
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/GetInvoices',
              data: '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"}],"Rows":[["' + sessionId + '","' + applicationName + '"]]}',
              method: 'POST'
          }).then(
               function successFn(response) {
                   return response.data;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }

      function addToCart(style, color, size, qty) {
        var applicationName = "SPI_APP";
        //var tempProduct = JSON.stringify(tempProduct);
        var storeId = "";
        var sessionId = localStorage.getItem("sessionId");
        var username = localStorage.getItem("username");
        var password = localStorage.getItem("password");
        if(localStorage.getItem("store")){
          storeId = localStorage.getItem("store");
        } 
        var account = localStorage.getItem("account");
        

          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/AddToCart',
              data: '{"HEADER":{"Columns":[{"Name": "SessionID","Type":"String"}, {"Name":"ApplicationName","Type":"String"}, {"Name":"Account","Type":"String"}, {"Name":"Store","Type":"String"}, {"Name":"Style","Type":"String"}, {"Name":"Color","Type":"String"}, {"Name":"UPC","Type":"String"}], "Rows":[["' + sessionId + '","' + applicationName + '","'+ account + '","' + storeId + '","' + style + '","' + color + '",""]]}, "DETAIL":{"Columns":[{"Name": "Size","Type":"String"}, {"Name":"Qty","Type":"Int16"}], "Rows":[["' + size +  '",' + qty + ']]}}',
              method: 'POST'
          }).then(
               function successFn(response) {
                   return response.data;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }

      function payInvoice(invoice, amount, address, address2, city, state, zip, cardName, cardNumber, expDate, csv, batchId, routingNumber, accountNumber, businessName) {
        var applicationName = "SPI_APP";
        //var tempProduct = JSON.stringify(tempProduct);
        var storeId = "";
        var sessionId = localStorage.getItem("sessionId");
        var username = localStorage.getItem("username");
        var password = localStorage.getItem("password");
        var tempData = "";
        var taxAmount = "0.00";
        if(localStorage.getItem("store")){
          storeId = localStorage.getItem("store");
        } 
        var account = localStorage.getItem("account");


        if(routingNumber == ""){
          tempData = '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name": "Invoice","Type":"String"},{"Name": "Amount","Type":"String"},{"Name":"BAddress1","Type":"String"},{"Name":"BAddress2","Type":"String"},{"Name":"BCity","Type":"String"},{"Name":"BState","Type":"String"}, {"Name":"BZip","Type":"String"}, {"Name":"BName","Type":"String"}, {"Name":"CC","Type":"String"}, {"Name":"ExpDate","Type":"String"}, {"Name":"CVV","Type":"String"}, {"Name":"STaxAmt","Type":"String"}, {"Name":"BatchID","Type":"String"}], "Rows":[["' + sessionId + '",' + invoice + ',"' + amount + '","' + address + '","'+ address2 + '","' + city + '","' + state + '","' + zip + '","' + cardName + '","' + cardNumber + '","' + expDate + '","' + csv + '","' + taxAmount + '","' + batchId + '"]]}';
        } else {
          tempData = '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name": "Invoice","Type":"String"},{"Name": "Amount","Type":"String"},{"Name":"BAddress1","Type":"String"},{"Name":"BAddress2","Type":"String"},{"Name":"BCity","Type":"String"},{"Name":"BState","Type":"String"}, {"Name":"BZip","Type":"String"}, {"Name":"BName","Type":"String"}, {"Name":"RoutingNumber","Type":"String"}, {"Name":"AccountNumber","Type":"String"}, {"Name":"STaxAmt","Type":"String"}, {"Name":"BatchID","Type":"String"}], "Rows":[["' + sessionId + '",' + invoice + ',"' + amount + '","' + address + '","'+ address2 + '","' + city + '","' + state + '","' + zip + '","' + businessName + '","' + routingNumber + '","' + accountNumber + '","' + taxAmount + '","' + batchId + '"]]}';
        }
        
          var tempResponse = [];
          return $http({
              url: 'https://secure.spiconnect.com/APPRESTWcfService/RestService.svc/PayInvoices',
              data: tempData,
              method: 'POST'
          }).then(
               function successFn(response) {

                  //response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
                  //response = response.replace('</string>', '');

                      for (var i = 0; i < response.data.Rows.length; i++) {

                          tempResponse.push({
                              success: response.data.Rows[i][0],
                              confirmationNumber: response.data.Rows[i][1],
                          });
                      }
                   return tempResponse;
               },
               function errorFn(response) {
                   return response;
               }
           );
      }

      function submitOrder(shipVia, purchaseOrderNumber, dropship, contactName, address1, address2, city, state, zip, promoCode, startDate, cancelBackorder, shipComplete) {
        var applicationName = "SPI_APP";
        //var tempProduct = JSON.stringify(tempProduct);
        var storeId = "";
        var sessionId = localStorage.getItem("sessionId");
        var username = localStorage.getItem("username");
        var password = localStorage.getItem("password");
        var taxAmount = "0.00";
        var tempData = "";
        var tempResponse = "";
        if(localStorage.getItem("store")){
          storeId = localStorage.getItem("store");
        } 
        var account = localStorage.getItem("account");

        //if(dropship == "yes"){
          tempData = '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name": "ApplicationName","Type":"String"},{"Name": "Account","Type":"String"},{"Name":"Store","Type":"String"},{"Name":"ShipVia","Type":"String"},{"Name":"Dropship","Type":"String"},{"Name":"Contact_Name","Type":"String"}, {"Name":"Address_1","Type":"String"}, {"Name":"Address_2","Type":"String"}, {"Name":"City","Type":"String"}, {"Name":"State_Code","Type":"String"}, {"Name":"Zip_Code","Type":"String"}, {"Name":"Country_Code","Type":"String"}, {"Name":"CustPurchOrder","Type":"String"}, {"Name":"PromoCode","Type":"String"}, {"Name":"startDate","Type":"String"}, {"Name":"CancelBackOrder","Type":"String"}, {"Name":"ShipComplete","Type":"String"}], "Rows":[["' + sessionId + '","' + applicationName + '","' + account + '","' + storeId + '","'+ shipVia + '","' + dropship + '","' + contactName + '","' + address1 + '","' + address2 + '","' + city + '","' + state + '","' + zip + '","","' + purchaseOrderNumber + '","' + promoCode + '","' + startDate + '","' + cancelBackorder + '","' + shipComplete + '"]]}';
        //} else {
         // tempData = '{"Columns":[{"Name":"SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"},{"Name":"Account","Type":"String"},{"Name":"Store","Type":"String"},{"Name":"ShipVia","Type":"String"}], "Rows":[["' + sessionId + '","' + applicationName + '","' + account + '","' + storeId + '","'+ shipVia + '"]]}';
        //}
          var tempResponse = [];
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/CreateSalesOrder',
              data: tempData,
              method: 'POST'
          }).then(
               function successFn(response) {

                  tempResponse = response.data;
                  tempResponse = tempResponse.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
                  tempResponse = tempResponse.replace('</string>', '');
                  return tempResponse;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }

      function getShippingOptions(sessionId) {
        var applicationName = "SPI_APP";
        var storeId = "";
        var sessionId = localStorage.getItem("sessionId");
        var username = localStorage.getItem("username");
        var password = localStorage.getItem("password");
        var taxAmount = "0.00";
        if(localStorage.getItem("store")){
          storeId = localStorage.getItem("store");
        } 
        var account = localStorage.getItem("account");
        
          var tempResponse = [];
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/GetShipViaList',
              data: '{"Columns":[{"Name": "SessionID","Type":"String"},{"Name":"ApplicationName","Type":"String"}],"Rows":[["' + sessionId + '","' + applicationName + '"]]}',
              method: 'POST'
          }).then(
               function successFn(response) {
                  return response.data;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }


      function removeCartItem(style, color, size) {
        var applicationName = "SPI_APP";
        var storeId = "";
        var sessionId = localStorage.getItem("sessionId");
        var username = localStorage.getItem("username");
        var password = localStorage.getItem("password");
        var taxAmount = "0.00";
        if(localStorage.getItem("store")){
          storeId = localStorage.getItem("store");
        } 
        var account = localStorage.getItem("account");
        
          var tempResponse = [];
          return $http({
              url: 'https://www.spiconnect.net/APPRESTWcfService/RestService.svc/RemoveCartItem',
              data: '{"Columns":[{"Name": "SessionID","Type":"String"}, {"Name":"ApplicationName","Type":"String"}, {"Name":"Account","Type":"String"}, {"Name":"Store","Type":"String"}, {"Name":"Style","Type":"String"}, {"Name":"Color","Type":"String"}, {"Name":"Size","Type":"String"}], "Rows":[["' + sessionId + '","' + applicationName + '","'+ account + '","' + storeId + '","' + style + '","' + color + '","' + size + '"]]}',
              method: 'POST'
          }).then(
               function successFn(response) {
                  response = response.data.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
                  response = response.replace('</string>', '');
                  return response;
               },
               function errorFn(response) {
                   return response.data;
               }
           );
      }

      return {
          login: login,
          getStores: getStores,
          searchInventory: searchInventory,
          searchInventoryUpc: searchInventoryUpc,
          getCart: getCart,
          getOrders: getOrders,
          getOrdersSearch: getOrdersSearch,
          getInvoices: getInvoices,
          addToCart: addToCart,
          payInvoice: payInvoice,
          getShippingOptions: getShippingOptions,
          removeCartItem: removeCartItem,
          submitOrder: submitOrder
      };
  }]);


retailApp.factory('Session', ['$http', 'Server', '$q', function ServerFactory($http, Server, $q) {
       
    var login = function (username, password) {

    var tempSession = [];
    var session = [];
    var deferred = $q.defer();
    var tempResponse = "";

    Server.login(username, password).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');      
        tempResponse = response.substring(0,5);

        if(tempResponse != "Error"){
          tempSession = JSON.parse(response);

        if (tempSession != null && tempSession.Rows[0][0] != 0) {

            session.push({
                sessionId: tempSession.Rows[0][1]
            });

            localStorage.setItem("sessionId", tempSession.Rows[0][1]);

            if(tempSession.Columns[6]["Name"] == "Account"){
                session.push({
                  account: tempSession.Rows[0][6]
              });
              localStorage.setItem("account", tempSession.Rows[0][6]);
            }

            if(tempSession.Columns[6]["Name"] == "Store"){
                session.push({
                    store: tempSession.Rows[0][6]
                });
                localStorage.setItem("store", tempSession.Rows[0][6]);
            }

        }
          else {
          session = "Error: " + tempSession.Rows[0][7];
        }
        } else {
          session = "Looks like something went wrong. Try again in a few minutes.";
        }

        deferred.resolve(session);
    });

    return deferred.promise;
  }

    var getStores = function (sessionId) {

    var tempStores = "";
    var stores = [];
    var deferred = $q.defer();
    var tempStoreSelect = "";
    var tempStoreId = "";

    Server.getStores(sessionId).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');
        tempStores = JSON.parse(response);

        for (var i = 0; i < tempStores.Rows.length; i++) {
            tempStoreSelect = tempStores.Rows[i][1];
            if(tempStores.Rows[i][1] == "No Store"){
              tempStoreId = "No Store";
            } else {
              tempStoreId = tempStores.Rows[i][0];
            }
            stores.push({
                storeId: tempStoreId,
                storeName: tempStores.Rows[i][1],
                storeSelect: tempStoreSelect.substring(0,20) + " (" + tempStores.Rows[i][0] + ")"
            });
        }

        deferred.resolve(stores);
    });

    return deferred.promise;
  }

  var getCart = function (sessionId) {

    var tempCart = "";
    var cart = 0;
    var deferred = $q.defer();
    var tempResponse = "";

    Server.getCart(sessionId).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');
        tempResponse = response.substring(0,5);

        if(tempResponse != "error"){
          tempCart = JSON.parse(response);

        if(tempCart.Rows.length > 0){
          for (var i = 0; i < tempCart.Rows.length; i++) {

              cart += parseFloat(tempCart.Rows[i][9]);
          }
        } else {
          cart = 0;
        }
      }
        else {
        cart = 0;
      }

        deferred.resolve(cart);
    });

    return deferred.promise;
  }

  var getCartItems = function (sessionId) {

    var tempItems = "";
    var items = [];
    var deferred = $q.defer();
    var tempResponse = "";

    Server.getCart(sessionId).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');
        tempResponse = response.substring(0,5);

        if(tempResponse != "error"){
          tempItems = JSON.parse(response);

        for (var i = 0; i < tempItems.Rows.length; i++) {

            items.push({
                style: tempItems.Rows[i][3],
                color: tempItems.Rows[i][4],
                size: tempItems.Rows[i][6],
                price: tempItems.Rows[i][7],
                qty: tempItems.Rows[i][9]
            });
        }
      } else {
        items = response;
      }

        deferred.resolve(items);
    });

    return deferred.promise;
  }

    var getOrders = function (sessionId) {

    var tempOrders = "";
    var orders = [];
    var deferred = $q.defer();
    var tempMinShipDate = "N/A";

    Server.getOrders(sessionId).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');

        if(response == "error: Wrong Login,Password or SessionId") {
          orders = "Session Expired";
        } else {
          tempOrders = JSON.parse(response);


          for (var i = 0; i < tempOrders.Rows.length; i++) {

            tempMinShipDate = "N/A";

            if(tempOrders.Rows[i][9].toString().trim() != "") {
                tempMinShipDate = tempOrders.Rows[i][9];
              }

              orders.push({
                  so: tempOrders.Rows[i][1],
                  po: tempOrders.Rows[i][2],
                  unitsTotal: tempOrders.Rows[i][3],
                  unitsShipped: tempOrders.Rows[i][4],
                  date: tempOrders.Rows[i][5],
                  status: tempOrders.Rows[i][6],
                  minShipDate: tempMinShipDate
              });
          }
      }

        deferred.resolve(orders);
    });

    return deferred.promise;
  }

    var getOrdersSearch = function (sessionId, searchValue) {

    var tempOrders = "";
    var orders = [];
    var deferred = $q.defer();
    var tempMinShipDate = "N/A";

    Server.getOrdersSearch(sessionId, searchValue).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');

        if(response == "error: Wrong Login,Password or SessionId") {
          orders = "Session Expired";
        } else {
          tempOrders = JSON.parse(response);

        
          for (var i = 0; i < tempOrders.Rows.length; i++) {

            tempMinShipDate = "N/A";

            if(tempOrders.Rows[i][9].toString().trim() != "") {
                tempMinShipDate = tempOrders.Rows[i][9];
              }

              orders.push({
                  so: tempOrders.Rows[i][1],
                  po: tempOrders.Rows[i][2],
                  unitsTotal: tempOrders.Rows[i][3],
                  unitsShipped: tempOrders.Rows[i][4],
                  date: tempOrders.Rows[i][5],
                  status: tempOrders.Rows[i][6],
                  minShipDate: tempMinShipDate
              });
          }
      }

        deferred.resolve(orders);
    });

    return deferred.promise;
  }

  var getInvoices = function (sessionId) {

    var tempInvoices = "";
    var invoices = [];
    var deferred = $q.defer();
    var tempResponse = "";

    Server.getInvoices(sessionId).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');
        tempResponse = response.substring(0,5);

        if(tempResponse != "error"){
          tempInvoices = JSON.parse(response);

        for(var i = tempInvoices.Rows.length - 1; i >= 0; i--) {

            invoices.push({
                invoice: tempInvoices.Rows[i][1],
                po: tempInvoices.Rows[i][2],
                invDate: tempInvoices.Rows[i][3],
                dueDate: tempInvoices.Rows[i][4],
                daysPastDue: tempInvoices.Rows[i][5],
                amount: tempInvoices.Rows[i][6],
                sTaxAmt: tempInvoices.Rows[i][7],
                batchId: tempInvoices.Rows[i][8]
            });
        }
      } else {
        invoices = response;
      }

        deferred.resolve(invoices);
    });

    return deferred.promise;
  }

    var searchInventory = function (style, color) {

    var tempProduct = "";
    var product = [];
    var productSize = [];
    var productDetail = [];
    var tempLowPrice = "";
    var tempHighPrice = "";
    var tempResponse = "";

    var deferred = $q.defer();

    Server.searchInventory(style, color).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');
        tempResponse = response.substring(0,5);

        if(tempResponse != "error"){
          tempProduct = JSON.parse(response);

          for (var i = 0; i < tempProduct.STYLE_COLOR.Rows.length; i++) {

              if(tempProduct.STYLE_COLOR.Rows[i][4]) {
                tempLowPrice = tempProduct.STYLE_COLOR.Rows[i][4].split('-')[0]; 
                tempLowPrice = tempLowPrice.replace(" ", "");
                tempHighPrice = tempProduct.STYLE_COLOR.Rows[i][4].split('-')[1]; 
                tempHighPrice = tempHighPrice.replace(" ", "");
              }
              product.push({
                  style: tempProduct.STYLE_COLOR.Rows[i][0],
                  color: tempProduct.STYLE_COLOR.Rows[i][1],
                  description: tempProduct.STYLE_COLOR.Rows[i][2],
                  fabric: tempProduct.STYLE_COLOR.Rows[i][3],
                  lowPrice: tempLowPrice,
                  highPrice: tempHighPrice,
                  saleRange: tempProduct.STYLE_COLOR.Rows[i][5],
                  imgUrl: tempProduct.STYLE_COLOR.Rows[i][6],
                  altImgUrl: tempProduct.STYLE_COLOR.Rows[i][7],
                  colorUrl: tempProduct.STYLE_COLOR.Rows[i][8],
              });
          }

          for (var i = 0; i < tempProduct.SIZE.Rows.length; i++) {
              productSize.push({
                  size: tempProduct.SIZE.Rows[i][0],
                  upc: tempProduct.SIZE.Rows[i][1],
                  availability: tempProduct.SIZE.Rows[i][2],
                  linePrice: tempProduct.SIZE.Rows[i][3],
                  salePrice: tempProduct.SIZE.Rows[i][4],
                  unitsInCart: tempProduct.SIZE.Rows[i][5],
                  sort: tempProduct.SIZE.Rows[i][6],
              });
          }

          product = product.concat(productSize);
           } else {
          product = response;
        }
        deferred.resolve(product);
    });

    return deferred.promise;
  }

  var searchInventoryUpc = function (upc) {

    var tempProduct = "";
    var product = [];
    var productSize = [];
    var productDetail = [];
    var tempLowPrice = "";
    var tempHighPrice = "";
    var tempResponse = "";
    var deferred = $q.defer();

    Server.searchInventoryUpc(upc).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');
        tempResponse = response.substring(0,5);

        if(tempResponse != "error"){
          tempProduct = JSON.parse(response);

          for (var i = 0; i < tempProduct.STYLE_COLOR.Rows.length; i++) {

              if(tempProduct.STYLE_COLOR.Rows[i][4]) {
                tempLowPrice = tempProduct.STYLE_COLOR.Rows[i][4].split('-')[0]; 
                tempLowPrice = tempLowPrice.replace(" ", "");
                tempHighPrice = tempProduct.STYLE_COLOR.Rows[i][4].split('-')[1]; 
                tempHighPrice = tempHighPrice.replace(" ", "");
              }
              product.push({
                  style: tempProduct.STYLE_COLOR.Rows[i][0],
                  color: tempProduct.STYLE_COLOR.Rows[i][1],
                  description: tempProduct.STYLE_COLOR.Rows[i][2],
                  fabric: tempProduct.STYLE_COLOR.Rows[i][3],
                  lowPrice: tempLowPrice,
                  highPrice: tempHighPrice,
                  saleRange: tempProduct.STYLE_COLOR.Rows[i][5],
                  imgUrl: tempProduct.STYLE_COLOR.Rows[i][6],
                  altImgUrl: tempProduct.STYLE_COLOR.Rows[i][7],
                  colorUrl: tempProduct.STYLE_COLOR.Rows[i][8],
              });
          }

          for (var i = 0; i < tempProduct.SIZE.Rows.length; i++) {
              productSize.push({
                  size: tempProduct.SIZE.Rows[i][0],
                  upc: tempProduct.SIZE.Rows[i][1],
                  availability: tempProduct.SIZE.Rows[i][2],
                  linePrice: tempProduct.SIZE.Rows[i][3],
                  salePrice: tempProduct.SIZE.Rows[i][4],
                  unitsInCart: tempProduct.SIZE.Rows[i][5],
                  sort: tempProduct.SIZE.Rows[i][6],
              });
          }

          product = product.concat(productSize);
        } else {
          product = response;
        }
        deferred.resolve(product);
    });

    return deferred.promise;
  }


  var getShippingOptions = function (sessionId) {

    var tempShipping = "";
    var shippingOptions = [];
    var deferred = $q.defer();
    var tempResponse = "";

    Server.getShippingOptions(sessionId).then(function (response) {
        response = response.replace('<?xml version="1.0" encoding="utf-8"?><string>', '');
        response = response.replace('</string>', '');
        tempResponse = response.substring(0,5);

        if(tempResponse != "error"){
        tempShipping = JSON.parse(response);

        for (var i = 0; i < tempShipping.Rows.length; i++) {

            shippingOptions.push({
                code: tempShipping.Rows[i][0],
                description: tempShipping.Rows[i][1]
            });
        }
      } else {
        shippingOptions = response;
      }

        deferred.resolve(shippingOptions);
    });

    return deferred.promise;
  }

  return {
    login: login,
    getStores: getStores,
    getCart: getCart,
    getCartItems: getCartItems,
    getOrders: getOrders,
    getOrdersSearch: getOrdersSearch,
    getInvoices: getInvoices,
    searchInventory: searchInventory,
    searchInventoryUpc: searchInventoryUpc,
    getShippingOptions: getShippingOptions
  };

  }])



