const { shell } = require('electron')
const ipc = require('electron').ipcRenderer
const jquery = require('jquery')
const handlebars = require('handlebars')

handlebars.registerHelper('zeropad', (n) => {
  return (n < 10) ? '0' + n : n
})

// TODO:  Refactor all the tings.

ipc.on('id', (_, id) => {
  const baseURL = 'https://api.tvmaze.com'
  jquery.getJSON(`${baseURL}/shows/${id}?embed=episodes`, (data) => {
    // fill in show details column
    const detailsSource = jquery('#show-details-template').html()
    const detailsTemplate = handlebars.compile(detailsSource)
    var detailsHtml = detailsTemplate(data)
    jquery('#show-details').html(detailsHtml)

    // fill in episode list column
    const listSource = jquery('#episode-list-template').html()
    const listTemplate = handlebars.compile(listSource)
    var listHtml = listTemplate(data)
    jquery('#episode-list').html(listHtml)

    // add magnet button actions
    jquery('tr').each((_, el) => {
      const showName = jquery(el).find('#show-name').text()
      const episodeString = jquery(el).find('#episode-string').text()
      const episodeResolution = '720p'
      const searchName = `${showName.replace(/[^ \w]/g, '')} ${episodeString} ${episodeResolution}`
      jquery(el).find('#episode-magnet').click(() => {
        const torrentSearch = require('torrent-search-api')
        torrentSearch.enableProvider('Rarbg')
        torrentSearch.search(searchName, 'TV', 1)
          .then((torrents) => {
            var magnetLink = torrents[0] ? torrents[0].magnet : ''
            if (!magnetLink) {
              shell.openExternal(`http://rarbg.to/torrents.php?search=${searchName}`, { activate: false })
            } else if (!shell.openExternal(magnetLink, { activate: false })) {
              alert('Do you have a torrent client app installed?' + '  ' +
                'There\'s some good ones out there.  Right now, I kind of like WebTorrent.')
            }
          })
          .catch((err) => { console.error(err) })
      })
    })
  })
})
