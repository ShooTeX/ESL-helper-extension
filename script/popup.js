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
  }
}

document.getElementById('switchButton').onclick = function(){
  active = !active
  chrome.storage.local.set({'active': active})
  document.getElementById('switchButton').checked = active
  chrome.tabs.reload();
}

document.getElementById('timerButton').onclick = function(){
  chrome.extension.sendMessage({ duration: document.getElementById('time').value, msg: "startTimer" });
}

$(document).ready(function(){
   $('body').on('click', 'a', function(){
     if($(this).attr('link') != null){
     chrome.tabs.create({url: $(this).attr('link')});
     return false;
      }
   });
});
