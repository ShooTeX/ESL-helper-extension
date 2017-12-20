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
  chrome.extension.sendMessage({ comment: document.getElementById('comment').value, duration: document.getElementById('time').value, msg: "startTimer" });
}

document.getElementById('quickOptBtn').onclick = function(){
}

document.getElementById('notOnResponse').onclick = function(){
  chrome.storage.sync.set({
    notOnResponse: document.getElementById('notOnResponse').checked
  }, function() {
    console.log(status)
  });
}

$(document).ready(function(){
   $('body').on('click', 'a', function(){
     if($(this).attr('link') != null){
     chrome.tabs.create({url: $(this).attr('link')});
     return false;
      }
   });

   chrome.storage.sync.get({
      notOnResponse: false
   }, function(items) {
     document.getElementById('notOnResponse').checked = items.notOnResponse;
   });
});
