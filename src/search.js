const { shell } = require('electron')
const jquery = require('jquery')
const handlebars = require('handlebars')

jquery(document).ready(() => {
  // handle the input search field
  jquery('input').focus()
  jquery('input').keyup((e) => {
    if (e.keyCode === 13) {
      jquery('input').trigger('enterKey')
    }
  })
  jquery('input').bind('enterKey', (e) => {
    // search and populate results
    // TODO: Can I search based on country of origin, etc.?
    const baseURL = 'https://api.tvmaze.com'
    jquery.getJSON(`${baseURL}/search/shows?q=${e.target.value}`, (data) => {
      const resultsSource = jquery('#search-results-template').html()
      const resultsTemplate = handlebars.compile(resultsSource)
      var resultsHtml = resultsTemplate(data)
      jquery('#search-results').html(resultsHtml)
      document.title = `${e.target.value}`
      jquery('div#search-results-details').each((_, el) => {
        const showId = jquery(el).find('#show-id').text().trim()
        jquery(el).find('#show-episodes-window').click(() => {
          // TODO: This should be refactored.
          const { BrowserWindow } = require('electron').remote
          let episodeWindow = new BrowserWindow({ width: 800, height: 600, titleBarStyle: 'hiddenInset' })
          episodeWindow.on('closed', () => { episodeWindow = null })
          episodeWindow.loadFile('./src/episodes.html')
          episodeWindow.webContents.on('did-finish-load', () => {
            episodeWindow.webContents.send('id', showId)
          })
        })
      })
    })
    // TODO: Deal with failure.
  })

  // open links in external browser
  jquery(document).on('click', 'a[href^="https"]', function (event) {
    event.preventDefault()
    shell.openExternal(this.href)
  })
})
