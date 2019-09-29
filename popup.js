'use strict';

let changeURL = document.getElementById('mm-share-url');
let inputForm = document.getElementById('input-form');
let tokenForm = document.getElementById('token-input-form');
let closePopup = document.getElementById('close-popup');
let initialLoader = document.getElementById('initial-loader');
let tokenExpired = document.getElementById('token-expired');
let canSent = true, accessToken;
const techBuzzId = "s6zpby9fftrbjbojnb99717xse";
const mmHost = "http://0.0.0.0:8080/";

chrome.tabs.getSelected(null,function(tab) {
  changeURL.setAttribute('value',  tab.url);
});

chrome.storage.sync.get('token', function(tokenObject) {
    let token = tokenObject['token'];
    initialLoader.setAttribute("hidden", true);
    if(token === undefined){
        tokenForm.removeAttribute("hidden");
    } else {
        accessToken = token;
        inputForm.removeAttribute("hidden")
    }
  });

tokenForm.onsubmit = function(e){
    e.preventDefault();
    const formData = new FormData(e.target);
    let token = formData.get('token').trim();
    if(token){
        chrome.storage.sync.set({'token': formData.get('token')}, function() {
            tokenForm.setAttribute("hidden", true);
            inputForm.removeAttribute("hidden");
            accessToken = formData.get('token');

        });
    }
};

tokenExpired.onsubmit = function(e){
    e.preventDefault();
    tokenExpired.setAttribute("hidden", true);
    tokenForm.removeAttribute("hidden");
};

closePopup.onclick = function(e){
    e.preventDefault();
    window.close();
};

function handleEvent(e) {
    let eventType = e.type, response, statusCode;
    if(eventType === 'load') {
        response = JSON.parse(e.target.responseText);
        statusCode = response['status_code'];
        if(statusCode === undefined){
            inputForm.innerHTML = "<div align='center'>Congratulations!!!. <br>" +
                "Post has been delivered at <a href='https://mm.jtg.tools/jtg/channels/techbuzz' target='_blank'>Tech Buzz</a>.</div>"
            //window.close();
        } else if(statusCode === 401){
            chrome.storage.sync.remove('token', function () {
               console.log("Expired token removed from store");
            });
            inputForm.setAttribute("hidden", true);
            tokenExpired.removeAttribute("hidden");
            canSent = true;
        }
    } else if(eventType === 'error' || eventType === 'abort'){
        canSent = true;
    }
}

function addListeners(xhr) {
    xhr.addEventListener('loadstart', handleEvent);
    xhr.addEventListener('load', handleEvent);
    xhr.addEventListener('loadend', handleEvent);
    xhr.addEventListener('progress', handleEvent);
    xhr.addEventListener('error', handleEvent);
    xhr.addEventListener('abort', handleEvent);
}

inputForm.onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open('POST', mmHost + "api/v4/posts", true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    addListeners(xhr);

    let postData = formData.get('url');
    let comment = formData.get('comment').trim();
    if(comment){
      postData = comment + "\n" + postData;
    }
    // Prevent multi-click
    if(canSent) {
        canSent = false;
        xhr.send(JSON.stringify(
            {
                "channel_id": techBuzzId,
                "message": postData
            }
        ));
    }
};


