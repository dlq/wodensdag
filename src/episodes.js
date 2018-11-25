const { shell } = require('electron')
const ipc = require('electron').ipcRenderer
const jquery = require('jquery')
const handlebars = require('handlebars')
const moment = require('moment')
const Store = require('electron-store')
const store = new Store()

handlebars.registerHelper('episode-string', (season, number, airdate) => {
  if (!(season && number) || (season > 1900)) {
    return airdate.replace(/-/g, ' ')
  } else {
    return `S${season.toString().padStart(2, '0')}E${number.toString().padStart(2, '0')}`
  }
})

ipc.on('id', (_, id) => {
  const baseURL = 'https://api.tvmaze.com'
  jquery.getJSON(`${baseURL}/shows/${id}?embed=episodes`, (data) => {
    document.title = data.name

    // fill in show details column
    const detailsSource = jquery('#show-details-template').html()
    const detailsTemplate = handlebars.compile(detailsSource)
    var detailsHtml = detailsTemplate(data)
    jquery('#show-details').html(detailsHtml)

    // filter out future episodes
    const dateStr = moment().format('YYYY-MM-DD')
    const episodes = { episodes: data._embedded.episodes.filter(episode => episode.airdate <= dateStr) }

    // fill in episode list column
    const listSource = jquery('#episode-list-template').html()
    const listTemplate = handlebars.compile(listSource)
    var listHtml = listTemplate(episodes)
    jquery('#episode-list').html(listHtml)

    // add magnet button actions
    jquery('div#episode-details').each((_, el) => {
      const showName = jquery('#show-name').text().trim()
      const episodeString = jquery(el).find('#episode-string').text().trim()
      // TODO: Changing the resolution while the window is open doesn't change the resolution
      const searchName = `${showName.replace(/[^ \w]/g, '')} ${episodeString} ${store.get('resolution', '720p')}`
      jquery(el).find('#episode-magnet').click(() => {
        const torrentSearch = require('torrent-search-api')
        torrentSearch.enableProvider('Rarbg')
        torrentSearch.search(searchName, 'TV', 1)
          .then((torrents) => {
            var magnetLink = torrents[0] ? torrents[0].magnet : ''
            if (!magnetLink) {
              // open link in a browser
              shell.openExternal(`http://rarbg.to/torrents.php?search=${searchName}`, { activate: false })
            } else {
              // open link in a torrent client
              if (!shell.openExternal(magnetLink, { activate: false })) {
                alert('Do you have a torrent client app installed?' + '  ' +
                  'There\'s some good ones out there.  Right now, I kind of like WebTorrent.')
              }
            }
          })
          .catch((err) => {
            console.error(err)
          })
      })
    })

    // scroll to bottom of the episode list
    jquery('html, body').scrollTop(jquery('html, body').height())
  })
  // TODO: I'm not handling if there's no data returned.
})
