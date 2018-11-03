const { shell } = require('electron')
const jquery = require('jquery')
var moment = require('moment')

function getFav (f) {
  return localStorage.getItem(f.show.id)
}

function toggleFav (f) {
  if (getFav(f)) { localStorage.removeItem(f.show.id) } else { localStorage.setItem(f.show.id, 'fav') }
}

function compareFav (a, b) {
  if (getFav(a)) { return (getFav(b)) ? 0 : -1 } else { return (getFav(b)) ? 1 : 0 }
}

function getSchedule (date, callback) {
  const baseURL = 'https://api.tvmaze.com'
  const dateStr = moment(date).format('YYYY-MM-DD')

  // TODO: Should countries be in the settings?
  jquery.when(
    jquery.getJSON(`${baseURL}/schedule?country=AU&date=${dateStr}`),
    jquery.getJSON(`${baseURL}/schedule?country=CA&date=${dateStr}`),
    jquery.getJSON(`${baseURL}/schedule?country=GB&date=${dateStr}`),
    jquery.getJSON(`${baseURL}/schedule?country=US&date=${dateStr}`)
  )
    .then((r1, r2, r3, r4) => {
      callback(
        [].concat(r1[0], r2[0], r3[0], r4[0])
          .sort((a, b) => {
            return compareFav(a, b) || // favourites first
            b.show.weight - a.show.weight || // weight, descending
            a.show.name.localeCompare(b.show.name) || // show name, ascending
            a.number - b.number // episode, ascending
          })
      )
    })
}

function getShow (name, callback) {
  const torrentSearch = require('torrent-search-api')
  // TODO: Should there be settings for search providers?
  torrentSearch.enableProvider('Rarbg')
  torrentSearch.search(name, 'TV', 1)
    .then((torrents) => { callback(torrents[0] ? torrents[0].magnet : '') })
    .catch((e) => { console.error(e) })
}

function getSeasonEpisodeString (s) {
  if (!(s.season && s.number) || (s.season > 1900)) {
    return s.airdate.replace(/-/g, ' ')
  } else {
    return `S${s.season.toString().padStart(2, '0')}E${s.number.toString().padStart(2, '0')}`
  }
}

// TODO: Should the resolution be a preference?
const resolution = '720p'

function setContent (date) {
  // add info and actions to navbar
  jquery('#date-now').text(moment(date).format('dddd, MMMM D, YYYY'))
  jquery('#date-previous').off('click').one('click', () => {
    setContent(moment(date).subtract(1, 'days').toDate())
  })
  // TODO: Should the next button be disabled when it's today?
  jquery('#date-next').off('click').one('click', () => {
    setContent(moment(date).add(1, 'days').toDate())
  })
  jquery('#search').off('click').one('click', () => {
    const { BrowserWindow } = require('electron').remote
    const windowStateKeeper = require('electron-window-state')
    let searchWindowState = windowStateKeeper({
      defaultWidth: 770,
      defaultHeight: 900,
      file: 'search-window-state.json'
    })
    let searchWindow = new BrowserWindow({
      x: searchWindowState.x,
      y: searchWindowState.y,
      width: searchWindowState.width,
      height: searchWindowState.height,
      titleBarStyle: 'hiddenInset'
    })
    searchWindowState.manage(searchWindow)
    searchWindow.loadFile('./src/search.html')
    searchWindow.on('closed', () => { searchWindow = null })
  })

  // start with an empty list
  jquery('#show-list').empty()

  getSchedule(date, (schedule) => {
    schedule.forEach((s) => {
      // if (!s.show.image) { return } // skip if there's no img

      var showCardClone = jquery('template#show-card').contents().clone() // new card

      // add img src
      showCardClone.find('#show-img')
        .attr('src', s.show.image ? s.show.image.medium : '')
        .attr('title', s.show.name)

      // add show and episode names
      showCardClone.find('#episode').text(getSeasonEpisodeString(s))
      showCardClone.find('#episode-name').text(s.name)

      // add episode window action
      showCardClone.find('#show-episodes-window').click(() => {
        // TODO: This should be refactored.  And I should figure out window management.
        const { BrowserWindow } = require('electron').remote
        let episodeWindow = new BrowserWindow({ width: 800, height: 600, titleBarStyle: 'hiddenInset' })
        episodeWindow.on('closed', () => { episodeWindow = null })
        episodeWindow.loadFile('./src/episodes.html')
        episodeWindow.webContents.on('did-finish-load', () => {
          episodeWindow.webContents.send('id', s.show.id)
        })
      })

      // add fav button state and action
      if (getFav(s)) showCardClone.find('#show-fav > i').toggleClass('fas').toggleClass('text-warning')
      showCardClone.find('#show-fav').click((event) => {
        toggleFav(s)
        jquery(event.currentTarget).children()
          .toggleClass('fas').toggleClass('text-warning')
        // TODO: Should the display refresh and re-sort with this new fav/unfav?
      })

      // add magnet button action
      showCardClone.find('#show-download-link').click(() => {
        const searchName = `${s.show.name.replace(/[^ \w]/g, '')} ${getSeasonEpisodeString(s)} ${resolution}`
        getShow(searchName, (magnetLink) => {
          if (!magnetLink) {
            shell.openExternal(`http://rarbg.to/torrents.php?search=${searchName}`, { activate: false })
          } else if (!shell.openExternal(magnetLink, { activate: false })) {
            alert('Do you have a torrent client app installed?' + '  ' +
              'There\'s some good ones out there.  Right now, I kind of like WebTorrent.')
            // TODO: After an alert the navbar isn't draggable.
          }
        })
      })

      jquery('#show-list').append(showCardClone) // add new card
    })
  })
}

setContent(moment().subtract(1, 'days').toDate())
