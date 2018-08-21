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

class Table {
  constructor (datasource, fields) {
    this.datasource = datasource
    this.fields = fields
    for (let key in this.fields) {
      this.fields[key].padding = this.datasource.reduce((prev, curr) => {
        const currlen = curr[key].toString().length
        return (prev < currlen)
          ? currlen
          : prev
      }, 0) + 2
    }
    this.table = {
      width: Object.keys(this.fields).map(field => this.fields[field].padding).reduce((prev, curr) => prev + curr),
      columns: Object.keys(this.fields).length
    }
  }

  display () {
    const header = Object.keys(this.fields).map(field => this.fields[field].title.padEnd(this.fields[field].padding)).join(' | ')
    const sep = Array.from(Array(this.table.width + 3 * this.table.columns + 1), _ => '-').join('')

    console.log(sep)
    console.log('| ' + header + ' |')
    console.log(sep)
    for (let source of this.datasource) {
      const row = Object.keys(this.fields).map(field => source[field].padEnd(this.fields[field].padding)).join(' | ')
      console.log('| ' + row + ' |')
    }
    console.log(sep)
  }
}

module.exports = Table
