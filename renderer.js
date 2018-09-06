// required by index.html

function getSchedule (date, callback) {
  const baseURL = 'http://api.tvmaze.com'

  var moment = require('moment')
  const dateStr = moment(date).format('YYYY-MM-DD')

  const countries = ['AU', 'CA', 'GB', 'NZ', 'US']

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
          return b.show.weight - a.show.weight ||
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
      const opn = require('opn')
      // TODO: Search for magnet link?
      if (torrents[0] && torrents[0].magnet) {
        opn(torrents[0].magnet, { wait: false })
          .catch((e) => {
            console.error(e)
          })
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

const day = 24 * 60 * 60 * 1000

// entry point

getSchedule(new Date(Date.now() - 1 * day), schedule => {
  // TODO: Is jquery worth it with this DOM manipulation?
  // const $ = require('jquery')
  var showList = document.querySelector('#show-list')
  var showCard = document.querySelector('template#show-card')
  schedule.forEach(s => {
    var showClone = document.importNode(showCard.content, true)
    showClone.querySelector('#show-img')['src'] = s.show.image ? s.show.image.medium : ''
    showClone.querySelector('#show-img').addEventListener('click', () => {
      getShow(`${s.show.name.replace(/[^ \w]/g, '')} ${getSEName(s)} ${resolution}`)
    })
    showClone.querySelector('#show-name').textContent = s.show.name
    showClone.querySelector('#episode').textContent = `${getSEName(s)}`
    showClone.querySelector('#episode-name').textContent = `${s.name}`

    var showTags = document.querySelector('template#show-tags')

    var countryClone = document.importNode(showTags.content, true)
    countryClone.querySelector('#show-tag').textContent = s.show.network ? `${s.show.network.country.code}` : ''
    countryClone.querySelector('#show-tag').classList.add('badge-secondary')
    showClone.querySelector('#show-footer').appendChild(countryClone)

    if (s.show.type !== 'Scripted') {
      var typeClone = document.importNode(showTags.content, true)
      typeClone.querySelector('#show-tag').textContent = `${s.show.type}`
      typeClone.querySelector('#show-tag').classList.add('badge-light')
      showClone.querySelector('#show-footer').appendChild(typeClone)
    }

    s.show.genres.forEach(tag => {
      var tagClone = document.importNode(showTags.content, true)
      tagClone.querySelector('#show-tag').textContent = `${tag}`
      tagClone.querySelector('#show-tag').classList.add('badge-light')
      tagClone.querySelector('#show-tag').classList.add('badge-pill')
      showClone.querySelector('#show-footer').appendChild(tagClone)
    })

    showList.appendChild(showClone)
  })
})
