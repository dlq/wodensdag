const { shell } = require('electron')
var moment = require('moment')

function getSchedule (date, callback) {
  const baseURL = 'http://api.tvmaze.com'

  const dateStr = moment(date).format('YYYY-MM-DD')

  const countries = ['AU', 'CA', 'GB', 'US']

  var promise = require('bluebird')
  var request = promise.promisifyAll(require('request'), { multiArgs: true })
  promise.map(countries, (code) => {
    const url = `${baseURL}/schedule?country=${code}&date=${dateStr}`
    return request.getAsync(url).spread((_, body) => {
      return JSON.parse(body)
    })
  }).then((results) => {
    callback(
      results
        .reduce((acc, val) => acc.concat(val), [])
        .sort((a, b) => {
          return (localStorage.getItem(a.show.id) ? (localStorage.getItem(b.show.id) ? 0 : -1) : (localStorage.getItem(b.show.id) ? 1 : 0 )) ||
            b.show.weight - a.show.weight ||
            a.show.name.localeCompare(b.show.name) ||
            a.number - b.number
        })
    )
  }).catch((error) => {
    console.error(error)
  })
}

function getShow (name) {
  const torrentSearch = require('torrent-search-api')
  torrentSearch.enableProvider('Rarbg')

  torrentSearch.search(name, 'TV', 1)
    .then(torrents => {
      if (torrents[0] && torrents[0].magnet) {
        shell.openExternal(torrents[0].magnet, { activate: false })
      } else {
        // TODO: Retry?
      }
    })
    .catch((e) => {
      console.error(e)
    })
}

function getSEName (s) {
  if (s.season && s.number) {
    if (s.season > 1900) {
      return `${s.airdate.replace(/-/g, ' ')}`
    } else {
      return `S${s.season.toString().padStart(2, '0')}E${s.number.toString().padStart(2, '0')}`
    }
  } else {
    return ''
  }
}

const resolution = '720p'

function setContent (date) {
  // TODO: Is jquery worth it with this DOM manipulation?
  const $ = require('jquery')

  document.querySelector('#date-now').textContent = moment(date).format('dddd, MMMM D, YYYY')

  $('#date-previous').off('click')
  $('#date-previous').one('click', () => { setContent(moment(date).subtract(1, 'days').toDate()) })
  $('#date-next').off('click')
  $('#date-next').one('click', () => { setContent(moment(date).add(1, 'days').toDate()) })

  $('#show-list').empty()

  getSchedule(date, schedule => {
    var showList = document.querySelector('#show-list')

    var showCard = document.querySelector('template#show-card')
    schedule.forEach(s => {
      if (s.show.image) {
        var showClone = document.importNode(showCard.content, true)
        showClone.querySelector('#show-img')['src'] = s.show.image ? s.show.image.medium : ''
        showClone.querySelector('#show-name').textContent = `${s.show.name} ${s.show.weight}`
        showClone.querySelector('#episode').textContent = `${getSEName(s)}`
        showClone.querySelector('#episode-name').textContent = `${s.name}`
        showClone.querySelector('#show-imdb-link').addEventListener('click', () => {
          shell.openExternal(`https://www.imdb.com/title/${s.show.externals.imdb}/`, { activate: false })
        })
        if (localStorage.getItem(s.show.id)) {
          showClone.querySelector('#show-fav').classList.toggle('active')
        }
        showClone.querySelector('#show-fav').addEventListener('click', (event) => {
          event.srcElement.classList.toggle('active')
          if (localStorage.getItem(s.show.id)) {
            localStorage.removeItem(s.show.id)
          } else {
            localStorage.setItem(s.show.id, 'fav')
            console.log(localStorage.getItem(s.show.id))
          }
        })
        showClone.querySelector('#show-download-link').addEventListener('click', () => {
          getShow(`${s.show.name.replace(/[^ \w]/g, '')} ${getSEName(s)} ${resolution}`)
          // TODO: Indicate no result somehow.
        })

        var showTags = document.querySelector('template#show-tags')
        var countryClone = document.importNode(showTags.content, true)
        countryClone.querySelector('#show-tag').textContent = s.show.network ? `${s.show.network.country.code}` : ''
        showClone.querySelector('#show-tag-list').appendChild(countryClone)
        if (s.show.type !== 'Scripted') {
          var typeClone = document.importNode(showTags.content, true)
          typeClone.querySelector('#show-tag').textContent = `${s.show.type}`
          showClone.querySelector('#show-tag-list').appendChild(typeClone)
        }
        s.show.genres.forEach(tag => {
          var tagClone = document.importNode(showTags.content, true)
          tagClone.querySelector('#show-tag').textContent = `${tag}`
          showClone.querySelector('#show-tag-list').appendChild(tagClone)
        })

        showList.appendChild(showClone)
      }
    })
  })
}

setContent(moment().subtract(1, 'days').toDate())
