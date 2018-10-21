const jquery = require('jquery')
const handlebars = require('handlebars')

jquery(document).ready(() => {
  jquery('input').keyup((e) => {
    if (e.keyCode === 13) {
      jquery('input').trigger('enterKey')
    }
  })
  jquery('input').bind('enterKey', (e) => {
    const baseURL = 'https://api.tvmaze.com'
    jquery.getJSON(`${baseURL}/search/shows?q=${e.target.value}`, (data) => {
      const resultsSource = jquery('#search-results-template').html()
      const resultsTemplate = handlebars.compile(resultsSource)
      var resultsHtml = resultsTemplate(data)
      jquery('#search-results').html(resultsHtml)

      console.log('foo')
      jquery('div#search-results-details').each((_, el) => {
        const showId = jquery(el).find('#show-id').text().trim()
        console.log(showId)
        jquery(el).find('#show-episodes-window').click(() => {
          const { BrowserWindow } = require('electron').remote
          let win = new BrowserWindow({ width: 800, height: 600, titleBarStyle: 'hiddenInset' })
          win.on('closed', () => { win = null })
          win.loadFile('./episodes.html')
          win.webContents.on('did-finish-load', () => {
            win.webContents.send('id', showId)
          })
        })
      })
    })
    // TODO: Deal with failure.
  })
})
