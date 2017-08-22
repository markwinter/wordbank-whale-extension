(function () {
  internationalize()
})()

function internationalize() {
  function setProperty(selector, prop, msg) {
    document.querySelector(selector)[prop] = whale.i18n.getMessage(msg)
  }

  setProperty('#id_title_help', 'innerText', 'titleHelp')
  setProperty('#id_title_anki', 'innerText', 'titleAnki')
  setProperty('#id_anki_text', 'innerText', 'ankiText')
  setProperty('#id_title_about', 'innerText', 'titleAbout')
  setProperty('#id_about_text', 'innerText', 'aboutText')
  setProperty('#id_title_version', 'innerText', 'titleVersion')
  setProperty('#id_title_author', 'innerText', 'titleAuthor')
  setProperty('#id_back', 'innerText', 'back')
}
