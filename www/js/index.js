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
let db;
let dbVersion = 1;
let dbReady = false;
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
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('dom content loaded');
        //register the events for upload and show picture. 
        document.querySelector('#pictureTest').addEventListener('change', doFile);

        document.querySelector('#testImageBtn').addEventListener('click', doImageTest);

        initDb();
        function initDb() {
                let request = indexedDB.open('testPics', dbVersion);

                request.onerror = function(e) {
                    console.error('Unable to open database.');
                }

                request.onsuccess = function(e) {
                    db = e.target.result;
                    console.log('db opened');
                }

                request.onupgradeneeded = function(e) {
                    let db = e.target.result;
                    db.createObjectStore('cachedForms', {keyPath:'id', autoIncrement: true});
                    dbReady = true;
                }
            } 
            function doFile(e) {
                console.log('change event fired for input field');
                let file = e.target.files[0];
                var reader = new FileReader();
//              reader.readAsDataURL(file);
                reader.readAsBinaryString(file);

                reader.onload = function(e) {
                    //alert(e.target.result);
                    let bits = e.target.result;
                    let ob = {
                        created:new Date(),
                        data:bits
                    };

                    let trans = db.transaction(['cachedForms'], 'readwrite');
                    let addReq = trans.objectStore('cachedForms').add(ob);

                    addReq.onerror = function(e) {
                        console.log('error storing data');
                        console.error(e);
                    }

                    trans.oncomplete = function(e) {
                        console.log('data stored');
                    }
                }
            }

            function doImageTest() {
                console.log('doImageTest');
                let image = document.querySelector('#testImage');
                var recordToLoad = parseInt(document.querySelector('#recordToLoad').value,10);
                if(recordToLoad === '') recordToLoad = 1;

                let trans = db.transaction(['cachedForms'], 'readonly');
                //hard coded id
                let req = trans.objectStore('cachedForms').get(recordToLoad);
                req.onsuccess = function(e) {
                    let record = e.target.result;
                    console.log('get success', record);
                    image.src = 'data:image/jpeg;base64,' + btoa(record.data);
                }
            }        
    }
};
