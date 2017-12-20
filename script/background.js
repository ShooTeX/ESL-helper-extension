let active,timer

let protests =[{id: 0, title: "", duration: 0}]

console.log(protests)

let navNode = '/rainbowsix/europe-pc/'

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

function startTimer(duration, comment){
  let time = duration*60000
  chrome.tabs.query({
  active: true,
  currentWindow: true
  },
  function(tabs) {
    let tab = tabs[0]
    let url = tab.url
    let currentTitle
    if(comment == ''){
      console.log(comment)
      currentTitle = tab.title
    }
    else{
      currentTitle = comment
    }
    let matching = /protest\/(\d+)/
    let protestId
    if(url.match(matching)){
      protestId = url.match(matching)[1]
    }
    else{
      alert("You're not in a protest. Timer is not set!")
      return
    }
    timer = setTimeout(function(){
      $(this).data(protestId, timer)
      addNotification(currentTitle,duration,protestId);
      // for (var i in protests){
      //   if(protests[i].id == protestId){
      //     protests.splice(i, 1)
      //   }
      // }
    }, time)
    // protests.push({"id": protestId, "title": currentTitle, "duration": time})
    // clearTimeout($(this).data(protestId))
  });
}

function addNotification(title,duration,id){
  notifySound.play()

  let notId = id.toString();

  chrome.notifications.create(notId, {
    type: 'basic',
    iconUrl: 'img/icon128.png',
    title: title,
    requireInteraction: true,
    message: duration + " minutes are over."
  })
}

function jumpToTab(id){
      let tabFound = false
      chrome.tabs.query({}, function(tabs){
        let matching = /protest\/(\d+)/
        let checkProtestId
        let tabId
        let tabFound = tabs.find(function(i){
          if(i.url.match(matching) && i.url.match(matching)[1] == id){
            tabId = i.id
          }

          return i.url.match(matching) && i.url.match(matching)[1] == id
        })
        if(tabFound){
          chrome.tabs.update(tabId, {highlighted: true})
          chrome.notifications.clear(id)
        }
        else{
          chrome.tabs.create({ url: "https://play.eslgaming.com" + navNode + "protest/" + id })
          chrome.notifications.clear(id)
        }
      })
}

chrome.notifications.onClicked.addListener(function(data) {
  var id = data
  jumpToTab(id)
});

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse){
        if(request.msg == "startTimer"){
          startTimer(request.duration, request.comment);
        }
    }
);

//Clear storage
/*chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }
})*/
