const axios = require('axios')
const jsdom = require('jsdom')
const ora = require('ora')
const baseurl = 'https://aur.archlinux.org/packages'
const { JSDOM } = jsdom
const searchString = process.argv.slice(2).join(' ')
const Table = require('./table')

function buildQuery (key) {
  return `${baseurl}/?O=0&SeB=nd&K=${encodeURIComponent(key)}&outdated=&SB=n&SO=a&PP=250&do_Search=Go`
}

function paddedLogger (padding) {
  return function log () {
    let row = '| '
    for (let arg of arguments) {
      row += arg.padEnd(padding) + ' | '
    }
    console.log(row)
  }
}

function separatorLogger (padding, elements = 2) {
  return function log () {
    console.log(Array.from(Array(padding * elements +  3 * elements + 1), (_) => '-').join(''))
  }
}

const spinner = ora(searchString !== '' ? `Searching for ${searchString}` : 'Searching for packages').start()
axios.get(buildQuery(searchString))
  .then(response => {
    spinner.stop()
    const dom = new JSDOM(response.data)
    const oddElements = dom.window.document.querySelectorAll('.odd')
    const evenElements = dom.window.document.querySelectorAll('.even')
    const elements = []

    const pushElement = (element) => elements.push(element)
    Array.prototype.forEach.call(oddElements, pushElement)
    Array.prototype.forEach.call(evenElements, pushElement)

    const short = (content) => {
      return content.length > 60
        ? content.substr(0, 60) + '...'
        : content
    }

    const formatted = elements.map(element => ({
      package: element.children[0].children[0].innerHTML,
      version: element.children[1].innerHTML,
      description: short(element.children[4].innerHTML)
    }))
    const packageTable = new Table(formatted, {
      package: { title: 'Pacote' },
      version: { title: 'Versão' },
      description: { title: 'Descrição' }
    })
    packageTable.display()
  })

