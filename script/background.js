let active,timer

let notifySound = new Audio()
notifySound.src = "audio/alert.ogg"

chrome.storage.local.get('active', function (data) {
  if(data.active == null){
    chrome.storage.local.set({'active': true})
    active = true;
  }
  else {
    active = data.active
  }
})

function startTimer(duration){
  let time = duration*6000
  chrome.tabs.query({
  active: true,
  currentWindow: true
  },
  function(tabs) {
    let tab = tabs[0]
    let currentURL = tab.url
    let currentTitle = tab.title
    let currentId = tab.id
    timer = setTimeout(function(){
      addNotification(currentTitle,duration,currentId,currentURL);

    }, time)
  });
}

function addNotification(title,duration,id,url){
  notifySound.play()

  let notId = id.toString();

  chrome.notifications.create(notId + "|" + url, {
    type: 'basic',
    iconUrl: 'img/icon128.png',
    title: title,
    message: duration + " minutes are over."
  })
}

function jumpToTab(id,url){
      let tabFound = false
      chrome.tabs.query({}, function(tabs){
        for (var i in tabs){
          if(tabs[i].id === id){
            tabFound = true
          }
        }
      })
      if(tabFound = true){
        chrome.tabs.update(id, {highlighted: true})
        chrome.notifications.clear(id + "|" + url)
        tabFound = false;
      }
      else{
        chrome.tabs.create({ url: url })
      }
}

chrome.notifications.onClicked.addListener(function(data) {
  var allData = data.split('|')
  var id = Number(allData[0])
  var url = allData[1]
  jumpToTab(id,url)
});

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "startTimer"){
          startTimer(request.duration);
        }
    }
);
/*chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }
})*/
