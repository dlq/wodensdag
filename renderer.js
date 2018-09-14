const { shell } = require('electron')
var moment = require('moment')
const $ = require('jquery')

function getFav (f) {
  return localStorage.getItem(f.show.id)
}

function toggleFav (f) {
  if (getFav(f)) localStorage.removeItem(f.show.id)
  else localStorage.setItem(f.show.id, 'fav')
}

function compareFav (a, b) {
  if (getFav(a)) return (getFav(b)) ? 0 : -1
  else return (getFav(b)) ? 1 : 0
}

function getSchedule (date, callback) {
  const baseURL = 'http://api.tvmaze.com'
  const dateStr = moment(date).format('YYYY-MM-DD')

  $.when(
    $.getJSON(`${baseURL}/schedule?country=AU&date=${dateStr}`),
    $.getJSON(`${baseURL}/schedule?country=CA&date=${dateStr}`),
    $.getJSON(`${baseURL}/schedule?country=GB&date=${dateStr}`),
    $.getJSON(`${baseURL}/schedule?country=US&date=${dateStr}`)
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
  torrentSearch.enableProvider('Rarbg')
  torrentSearch.search(name, 'TV', 1)
    .then((torrents) => { callback(torrents[0] ? torrents[0].magnet : '') })
    .catch((e) => { console.error(e) })
}

function getSeasonEpisodeString (s) {
  if (!(s.season && s.number) || (s.season > 1900)) return s.airdate.replace(/-/g, ' ')
  else return `S${s.season.toString().padStart(2, '0')}E${s.number.toString().padStart(2, '0')}`
}

// TODO: Should the resolution be a preference?
const resolution = '720p'

function setContent (date) {
  // add info and actions to navbar
  $('#date-now').text(moment(date).format('dddd, MMMM D, YYYY'))
  $('#date-previous').off('click')
    .one('click', () => { setContent(moment(date).subtract(1, 'days').toDate()) })
  $('#date-next').off('click')
    .one('click', () => { setContent(moment(date).add(1, 'days').toDate()) })

  // start with an empty list
  $('#show-list').empty()

  getSchedule(date, (schedule) => {
    schedule.forEach((s) => {
      var scClone = $('template#show-card').contents().clone()

      // add img src
      scClone.find('#show-img').attr('src', s.show.image ? s.show.image.medium : '')

      // add show and episode names
      scClone.find('#show-name').text(s.show.name)
      scClone.find('#episode').text(getSeasonEpisodeString(s))
      scClone.find('#episode-name').text(s.name)

      // add tags
      if (s.show.type !== 'Scripted') s.show.genres.unshift(s.show.type)
      if (s.show.network) s.show.genres.unshift(s.show.network.country.code)
      s.show.genres.forEach((tag) => {
        scClone.find('#show-tag-list').append(
          $('template#show-tags').contents().clone()
            .text(tag))
      })

      // add imdb button action
      scClone.find('#show-imdb-link').click(() => {
        shell.openExternal(`https://www.imdb.com/title/${s.show.externals.imdb}/`, { activate: false })
        // TODO: What if there's no imdb title?
      })

      // add fav button state and action
      if (getFav(s)) scClone.find('#show-fav > i').toggleClass('fas')
      scClone.find('#show-fav').click((event) => {
        $(event.currentTarget).children().toggleClass('fas')
        toggleFav(s)
        // TODO: Should the display refresh and re-sort with this new fav/unfav?
      })

      // add mag button action
      scClone.find('#show-download-link').click(() => {
        const searchName = `${s.show.name.replace(/[^ \w]/g, '')} ${getSeasonEpisodeString(s)} ${resolution}`
        getShow(searchName, (magnetLink) => {
          shell.openExternal(magnetLink, { activate: false })
          // TODO: What if there's no magnet link?
          // TODO: What if there's no torrent app?
          // TODO: Should I retry with other names?
        })
      })
      $('#show-list').append(scClone)
    })
  })
}

setContent(moment().subtract(1, 'days').toDate())
