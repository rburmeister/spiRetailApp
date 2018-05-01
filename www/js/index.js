/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

            if(device.platform == "iOS"){
                StatusBar.hide();
            }
            
            FastClick.attach(document.body);


                if (window.webkit) {
                    //WKWebView  
                    console.log('New WK Webview');          
                }

                //Prevent App from backingout of app once logged in
                document.addEventListener("backbutton", function (e) {
                     if(window.location.href == "file:///android_asset/www/index.html#/home" || window.location.href == "file:///android_asset/www/index.html#/login" || window.location.href == "file:///android_asset/www/index.html#/select-store"){
                       e.preventDefault();
                       }
                       else {
                           navigator.app.backHistory();
                       }
                }, false );

                window.addEventListener('native.keyboardshow', function(e){ 
                    setTimeout(function() {
                        document.activeElement.scrollIntoViewIfNeeded();
                    }, 100);
                });




                //         $(document).on('focus', 'select, input, textarea', function () {
                //     $('#main-headerbar').css({'position': 'absolute', 'top': '0px' });
                // });
                // $(document).on('blur', 'select, input, textarea', function () {
                //     $('#main-headerbar').css({ 'position': 'fixed' });
                // });



            // if (navigator.platform == 'iPad' || navigator.platform == 'iPhone' || navigator.platform == 'iPod' || navigator.platform == 'Linux armv6l') 
            //     {
            //           $('input').unbind('focusout');
            //             $(document).on('focusout', 'input', function() {
            //                 setTimeout(function() {
            //                     window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
            //                console.log('Scrolling');
            //                 }, 200);
            //             });
            //                                 //document.addEventListener('touchmove', function(e) {e.preventDefault();}, true);
                    
            //         window.addEventListener('touchmove', function(e) {
            //             console.log('Scrolling2');
            //             $("#top-bar").css("position", "fixed");
            //             $("#top-bar").css("top", "0");
            //         }, true);


            //     // This is the magic, this gives me "live" scroll events
            //     window.addEventListener('gesturechange', function() {console.log("needthis");});

            //         window.onscroll = function() 
            //         { 
            //                             // var iPadPosition = window.innerHeight + window.pageYOffset-45; // 45 is the height of the Footer
            //                             //  $("#top-bar").css("position", "fixed");
            //                             //  $("#top-bar").css("top", "0");
            //                             //  $("#top-bar").css("display", "block");
            //                             //  console.log('Scrolling');
            //         }
            //     }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

    }
};
