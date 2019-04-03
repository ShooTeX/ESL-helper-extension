let active,timer

const spreadsheet = 'https://spreadsheets.google.com/feeds/list/1fSkzMvrvM8RX0ELuOMyyhEJ0J1869Awk_PMNhR6ze8Q/od6/public/values?alt=json'

let protests =[{id: 0, title: "", duration: 0}]

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

function addNotification(title,duration,id,message){
  notifySound.play()

  let notId = id.toString();
  let setMessage
  if (message == null){
    setMessage = duration + " minutes are over."
  }
  else {
    setMessage = message
  }

  chrome.notifications.create(notId, {
    type: 'basic',
    iconUrl: 'img/icon128.png',
    title: title,
    requireInteraction: true,
    message: setMessage
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
          console.log(tabId)
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
        if(request.msg == "notify"){
          addNotification(request.title,0,request.id,request.message)
        }
        if (request.msg == 'customAnswers') {
          // fetch(spreadsheet).then(response => sendResponse({data: response.json()}))
          // fetch(spreadsheet).then(response => console.log(response.json()))
          $.ajax({
            url:spreadsheet,
            datatype: 'jsonp',
            success:function(data) {
              console.log(data)

              sendResponse({data})
            },
        });
      }
      return true
    }
);

//Clear storage
/*chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }
})*/
