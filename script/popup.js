let active, currentURL, currentID

chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
  currentURL = tabs[0].url
  currentID = tabs[0].id
  checkURL()
});

function checkURL(){
  if(currentURL.indexOf('https://play.eslgaming.com/') >= 0){
    chrome.storage.local.get(['active'], function(data){
      document.getElementById('switchButton').checked = data.active
      active = data.active
    })
  }
  else{
    document.getElementById('switchButton').disabled = true;

    //should be in background.js
    /*chrome.browserAction.setIcon({
      path : '../img/icon-off-38.png',
      tabId: currentID
    });*/
  }
}

document.getElementById('switchButton').onclick = function(){
  active = !active
  chrome.storage.local.set({'active': active})
  document.getElementById('switchButton').checked = active
  chrome.tabs.reload();
}
