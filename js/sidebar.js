(function () {
  leternationalize()

  whale.runtime.sendMessage({sidebarOpened: true})

  whale.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.sidebarOpenedAck && message.selectedText === "") {
      //loadSelect()
      loadTable()
      return
    }

    $('#add-word-form').css('display', 'block')
    $('#id_cancel_new').css('display', 'inline')
    $('#id_add_new').css('display', 'none')
    $('#id_first_language').val(message.selectedText)
    $('#id_second_language').focus()
    //loadSelect()
    loadTable()
  })

  whale.sidebarAction.onClicked.addListener((result) => {
    $('#add-word-form').css('display', 'none')
    $('#id_cancel_new').css('display', 'none')
    $('#id_add_new').css('display', 'inline')
    $('#id_first_language').val("")
    $('#id_first_language').focus()
    //loadSelect()
    loadTable()
  })

  $('#id_settings').on('click', (event) => {
    event.preventDefault()
    resetPage()
    window.location.href = "/settings.html"
  })

  $('#id_add_new').on('click', () => {
    $('#add-word-form').css('display', 'block')
    $('#id_cancel_new').css('display', 'inline')
    $('#id_add_new').css('display', 'none')
  })

  $('#id_cancel_new').on('click', () => {
    resetPage()
  })

  $('#id_save_button').on('click', (event) => {
    event.preventDefault()

    firstWord = $('#id_first_language').val()
    secondWord = $('#id_second_language').val()

    if (firstWord !== "" && secondWord !== "") {
      whale.storage.sync.get({"wordlist": []}, (result) => {
        let wordlist = result.wordlist
        const id = wordlist.length + 1
        wordlist.push({id, firstWord, secondWord})
        whale.storage.sync.set({wordlist}, () => {
          addRowToTable(id, firstWord, secondWord)
        })
      })
    }

    resetPage()
  })

  $('#id_export_anki').on('click', () => {
    exportToAnki()
  })

  $('#id_export_csv').on('click', () => {
    exportToCSV()
  })

  $('#id_export_plain').on('click', () => {
    exportToPlainText()
  })

  $('#id_clear_all').on('click', (event) => {
    event.preventDefault()
    whale.storage.sync.set({"wordlist": []})
    clearTable()
  })
})()

let tableLoaded = false
let selectLoaded = false

function loadSelect() {
  if (selectLoaded)
    return

  // TODO: Add existing groups to select

  $('#id_group').select2({
    tags: true
  })

  selectLoaded = true
}

function loadTable() {
  // Dont load table again if already loaded elements
  if (tableLoaded)
    return

  const table = $('#table').DataTable({
      rowReorder: {
        selector: "i.fa.fa-arrows.move",
        dataSrc: "id"
      },
      paging: false,
      searching: false,
      responsive: true,
      ordering: true,
      info: false,
      data: [],
      columns: [
        { data: "id"},
        { data: "firstWord"},
        { data: "secondWord"},
        { render: function() {
          return "<i class='fa fa-arrows move' style='margin-right:30px'></i><i class='fa fa-times delete' style='color:#dc3545'></i>"
        }}
      ],
      columnDefs: [
        { targets: 0, visible: false},
        { targets: '_all', orderable: false}
      ],
      order: [
        [0, "asc"]
      ],
      "fnDrawCallback": function(oSettings) {
        $("i.fa.fa-times.delete").click(function(event) {
          removeRowFromTable($(this).closest("tr"))
        });
      }
  })

  whale.storage.sync.get({"wordlist": []}, (result) => {
    // Not the most efficient but only way I can get it working for some reason
    result.wordlist.forEach((wordpair) => {
      addRowToTable(wordpair.id, wordpair.firstWord, wordpair.secondWord, table)
    })
  })

  table.on('row-reorder', (e, diff, edit) => {
    // Return if no reordering has taken place
    if (diff.length === 0)
      return

    updateIdsInStorage(diff)
  })

  tableLoaded = true
}

function clearTable() {
  $('#table').DataTable({retrieve: true}).clear().draw()
}

let lastWords = null
function removeRowFromTable(row) {
  let words = []
  row.children().each(function() {
    words.push($(this).text())
  })

  if (JSON.stringify(words) == JSON.stringify(lastWords))
    return

  removeFromStorage(words[0], words[1])
  $('#table').DataTable({retrieve: true}).row(row).remove().draw()

  lastWords = words
}

function addRowToTable(id, firstWord, secondWord, table = undefined) {
  if (!table)
    table = $('#table').DataTable({retrieve: true})

  table.row.add({
    "id": id,
    "firstWord": firstWord,
    "secondWord": secondWord
  }).draw()
}

function resetPage() {
  $('#id_first_language').val("")
  $('#id_second_language').val("")
  $('#add-word-form').css('display', 'none')
  $('#id_cancel_new').css('display', 'none')
  $('#id_add_new').css('display', 'inline')
}

function exportToAnki() {
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

function exportToCSV() {
  whale.storage.sync.get({"wordlist": []}, (result) => {
    const wordlist = result.wordlist
    let data = `"First Word","Second Word"\r\n`
    wordlist.forEach((wordpair) => {
      data += `"${wordpair.firstWord}","${wordpair.secondWord}"\r\n`
    })
    data = encodeURIComponent(data)
    whale.tabs.create({url: `data:text/plain;charset=utf-8,${data}`})
  })
}

function exportToPlainText() {
  whale.storage.sync.get({"wordlist": []}, (result) => {
    const wordlist = result.wordlist

    const max = 100;
    const spacer = 50;

    let data = ""
    for (let i = 0; i < max; i++)
      data += "-"
    data += "\r\n| First Word "

    for (let i = 0; i < spacer - "| First Word ".length; i++)
      data += " "
    data += "| Second Word "

    for (let i = 0; i < spacer - "| Second Word ".length - 1; i++)
      data += " "
    data += "|\r\n"

    for (let i = 0; i < max; i++)
      data += "-"
    data += "\r\n"

    wordlist.forEach((wordpair) => {
      data += `| ${wordpair.firstWord}`
      for (let i = 0; i < spacer - `| ${wordpair.firstWord}`.length; i++)
        data += " "
      data += "| "
      data += `${wordpair.secondWord}`
      for (let i = 0; i < spacer - `| ${wordpair.secondWord}`.length - 1; i++)
        data += " "
      data += "|\r\n"
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

function addToStorage({id, firstWord, secondWord}) {
  whale.storage.sync.get({"wordlist": []}, (result) => {
    let wordlist = result.wordlist
    wordlist.push({id, firstWord, secondWord})
    whale.storage.sync.set({wordlist})
  })
}

async function updateIdsInStorage(diff) {
  oldObjects = {}
  diff.forEach((item) => {
      oldObjects[item.oldData] = {newid: item.newData}
  })

  whale.storage.sync.get({"wordlist": []}, (result) => {
    let wordlist = result.wordlist

    wordlist.forEach((wordpair) => {
      if (oldObjects.hasOwnProperty(wordpair.id)) {
        wordpair.id = oldObjects[wordpair.id].newid
      }
    })

    whale.storage.sync.set({wordlist})
  })
}

function leternationalize() {
  function setProperty(selector, prop, msg) {
    document.querySelector(selector)[prop] = whale.i18n.getMessage(msg)
  }

  setProperty('#id_export', 'innerHTML', 'export')
  setProperty('#id_add_new', 'innerText', 'addNewWord')
  setProperty('#id_cancel_new', 'innerText', 'cancelNewWord')
  setProperty('#id_title_add_new', 'innerText', 'titleAddNew')
  setProperty('#id_save_button', 'innerText', 'saveNewWord')
  setProperty('#id_title_word_bank', 'innerText', 'titleWordBank')
  setProperty('#id_th_1', 'innerText', 'tableColFirst')
  setProperty('#id_th_2', 'innerText', 'tableColSecond')
  setProperty('#id_clear_all', 'innerText', 'clearAllWords')
  setProperty('#id_first_language', 'placeholder', 'placeholderNewWord')
  setProperty('#id_second_language', 'placeholder', 'placeholderTranslation')
}
