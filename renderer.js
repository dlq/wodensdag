// required by index.html

function getSchedule (country, date, callback) {
  const baseURL = 'http://api.tvmaze.com'
  var moment = require('moment')
  const dateStr = moment(date).format('YYYY-MM-DD')
  let scheduleURL = `${baseURL}/schedule?country=${country}&date=${dateStr}`

  var request = require('request')

  request(scheduleURL, (error, response, body) => {
    if (error) {
      console.error(error)
    } else {
      try {
        callback(
          JSON.parse(body)
            .map(e => {
              return {
                episodeName: e.name,
                season: e.season,
                episode: e.number,
                summary: e.summary,
                showName: e.show.name,
                weight: e.show.weight,
                site: e.show.officialSite,
                imdb: e.show.externals.imdb,
                image: e.show.image ? e.show.image.medium : null,
                description: e.show.summary,
                tags: e.show.genres
              }
            })
            .sort((a, b) => {
              return b.weight - a.weight ||
              a.showName.localeCompare(b.showName) ||
              a.episode - b.episode
            })
        )
      } catch (e) {
        console.error(e)
      }
    }
  })
}

function getShow (name) {
  const torrentSearch = require('torrent-search-api')

  torrentSearch.enablePublicProviders()

  torrentSearch.search(name, 'All')
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

const resolution = '720p'

function pad (number) { return '0' + number.toString().slice(-2) }

function getSEName (show) {
  if (show.season && show.episode) {
    return `S${pad(show.season)}E${pad(show.episode)}`
  } else {
    return ''
  }
}

const day = 24 * 60 * 60 * 1000

// entry point

getSchedule('US', new Date(Date.now() - 1 * day), schedule => {
  var showList = document.querySelector('#show-list')
  var showCard = document.querySelector('template#show-card')
  schedule.forEach(show => {
    var showClone = document.importNode(showCard.content, true)
    showClone.querySelector('#show-img')['src'] = show.image
    showClone.querySelector('#show-name').textContent = show.showName
    showClone.querySelector('#episode').textContent = `${getSEName(show)}`
    showClone.querySelector('#episode-name').textContent = `${show.episodeName}`
    var showTags = document.querySelector('template#show-tags')
    show.tags.forEach(tag => {
      var tagClone = document.importNode(showTags.content, true)
      tagClone.querySelector('#show-tag').textContent = `${tag}`
      showClone.querySelector('#show-footer').appendChild(tagClone)
    })
    showList.appendChild(showClone)
  })
})
