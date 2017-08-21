let selectedText = "";

const onClickHandler = (info, tab) => {
  selectedText = info.selectionText
  whale.sidebarAction.show(() => {
    whale.runtime.sendMessage({selectedText})
  })
}

whale.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.sidebarOpened)
    whale.runtime.sendMessage({sidebarOpenedAck: true, selectedText})
})

whale.contextMenus.onClicked.addListener(onClickHandler)

whale.runtime.onInstalled.addListener(function() {
  const contextMenuOptions = {
    title: "Add: %s",
    contexts: ["selection"]
  }
  whale.contextMenus.create(contextMenuOptions)
})
