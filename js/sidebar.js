(function () {
  whale.runtime.sendMessage({sidebarOpened: true})

  whale.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.sidebarOpenedAck && message.selectedText === "") {
      loadTable()
      return
    }

    document.getElementById('add-word-form').style.display = "block"
    document.getElementById('id_cancel_new').style.display = "inline"
    document.getElementById('id_add_new').style.display = "none"
    document.getElementById('id_first_language').value = message.selectedText
    document.getElementById('id_second_language').focus()
    loadTable()
  })

  whale.sidebarAction.onClicked.addListener((result) => {
    document.getElementById('add-word-form').style.display = "none"
    document.getElementById('id_cancel_new').style.display = "none"
    document.getElementById('id_add_new').style.display = "inline"
    document.getElementById('id_first_language').value = ""
    document.getElementById('id_first_language').focus()
    loadTable()
  });

  document.getElementById('id_settings').addEventListener('click', (event) => {
    whale.extension.getBackgroundPage().console.log("Settings icon clicked")
    event.preventDefault()
    resetPage()
    window.location.href = "/settings.html"
  }, false)

  document.getElementById('id_add_new').addEventListener('click', () => {
    document.getElementById('add-word-form').style.display = "block"
    document.getElementById('id_cancel_new').style.display = "inline"
    document.getElementById('id_add_new').style.display = "none"
  }, false)

  document.getElementById('id_cancel_new').addEventListener('click', () => {
    resetPage()
  }, false)

  document.getElementById('id_save_button').addEventListener('click', (event) => {
    event.preventDefault()

    firstWordElement = document.getElementById('id_first_language')
    firstWord = firstWordElement.value
    secondWordElement= document.getElementById('id_second_language')
    secondWord = secondWordElement.value

    if (firstWord !== "" && secondWord !== "") {
      whale.storage.sync.get({"wordlist": []}, (result) => {
        let wordlist = result.wordlist
        wordlist.push({firstWord, secondWord})
        whale.storage.sync.set({wordlist}, () => {
          addRowToTable(firstWord, secondWord)
        })
      })
    }

    resetPage()
  }, false)

  document.getElementById('id_export').addEventListener('click', () => {
    saveTextFile()
  }, false)

  document.getElementById('id_clear_all').addEventListener('click', (event) => {
    event.preventDefault()
    whale.storage.sync.set({"wordlist": []})
    clearTable()
  }, false)
})()

let tableLoaded = false

function loadTable() {
  // Dont load table again if already loaded elements
  if (tableLoaded)
    return

  whale.storage.sync.get({"wordlist": []}, (result) => {
    const wordlist = result.wordlist
    wordlist.forEach((wordpair) => {
      addRowToTable(wordpair.firstWord, wordpair.secondWord)
    })
  })

  tableLoaded = true
}

function clearTable() {
  let table = document.getElementById('table-body')
  while (table.rows.length > 0)
    table.deleteRow(0)
}

function addRowToTable(firstWord, secondWord) {
  let tableRef = document.getElementById('table-body')
  let newRow = tableRef.insertRow(tableRef.rows.length)
  newRow.insertCell(0).appendChild(document.createTextNode(firstWord))
  newRow.insertCell(1).appendChild(document.createTextNode(secondWord))

  let deleteElem = document.createElement('i')
  deleteElem.classList.add('fa')
  deleteElem.classList.add('fa-times')
  deleteElem.style.color = "#dc3545"
  deleteElem.onclick = (event) => {
    newRow.remove()
    removeFromStorage(firstWord, secondWord)
  }
  newRow.insertCell(2).appendChild(deleteElem)
}

function resetPage() {
  document.getElementById('id_first_language').value = ""
  document.getElementById('id_second_language').value = ""
  document.getElementById('add-word-form').style.display = "none"
  document.getElementById('id_cancel_new').style.display = "none"
  document.getElementById('id_add_new').style.display = "inline"
}

function saveTextFile() {
  whale.storage.sync.get({"wordlist": []}, (result) => {
    const wordlist = result.wordlist
    let data = ""
    wordlist.forEach((wordpair) => {
      data += `${wordpair.firstWord};${wordpair.secondWord}\r\n`
    })
    data = encodeURIComponent(data)
    whale.tabs.create({url: `data:text/plain;charset=utf-8,${data}`})
  })
}

function removeFromStorage(firstWord, secondWord) {
  whale.storage.sync.get({"wordlist": []}, (result) => {
    let wordlist = result.wordlist
    wordlist = wordlist.filter((wordpair) => {
      return wordpair.firstWord != firstWord && wordpair.secondWord != secondWord
    })
    whale.storage.sync.set({wordlist})
  })
}
