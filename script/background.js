var active
chrome.storage.local.get('active', function (data) {
  if(data.active == null){
    chrome.storage.local.set({'active': true})
    active = true;
  }
  else {
    active = data.active
  }

  console.log(active)
})

/*chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }
})*/
