/*
  This generator is a bit different from the rest. Fontawesome uses
  a prefix (ex: 'fab', 'fas', etc) to determine which font file to
  use. However, this information is not in the css file that we will
  be parsing. So, we open the old fontawesome-v5.js file (which was
  made for web, not node), read it in, make adjustments, and eval it
  (yeah I know, eval bad). Then we make a map of fonts and the
  prefixes to we can add the prefix back. If it's a new font, we make
  the prefix '---' so we can search the file for it and hand-curate
  the prefix manually. Then, we have a fiished file.
*/
const fs = require('fs')
const path = require('path')

const inputLocation = '../src/component/utils/fontawesome-v5.js'
const outputLocation = '../src/component/utils/fontawesome-v5.js'
let oldIcons = {}
let icons = []
let blacklisted = [
  'fa-font-awesome-logo-full'
]

let fa = fs.readFileSync(path.resolve(__dirname, inputLocation), 'utf8')
fa = fa.split('\n')
fa.shift()
fa.unshift('[')
fa = fa.join('\n')
// eslint-disable-next-line no-eval
fa = eval(fa)
fa.forEach(f => {
  let names = f.name.split(' ')
  oldIcons[names[1]] = names[0]
})

const location = require.resolve('@quasar/extras/fontawesome-v5/fontawesome-v5.css')
const fileContents = fs.readFileSync(location, 'utf8')

fileContents
  .split('\n')
  .forEach(line => {
    if (line.startsWith('.')) {
      const pos = line.indexOf(':before')
      if (pos > 0) {
        line = line.slice(1, pos)
        if (blacklisted.includes(line) === false) {
          if (oldIcons[line]) {
            icons.push(oldIcons[line] + ' ' + line)
          } else {
            icons.push('--- ' + line)
          }
        }
      }
    }
  })

let output = 'export default [\n'
icons.forEach((icon, index) => {
  if (index !== 0) output += ',\n'
  output += `  { name: '${icon}' }`
})
output += '\n]\n'

fs.writeFileSync(path.resolve(__dirname, outputLocation), output, 'utf8')
console.log(`Fontawesome v5 Icons generation: Done - count: ${icons.length}`)
