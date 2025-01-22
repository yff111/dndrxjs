const { writeFileSync } = require('node:fs')
const { faker } = require('@faker-js/faker')

function writeDataToJSONFile(data, path = './mock-data.json') {
  try {
    writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
    console.log('Data successfully saved to disk')
  }
  catch (error) {
    console.log('An error has occurred ', error)
  }
}

writeDataToJSONFile(
  Array.from(Array.from({ length: 40 })).map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
  })),
  './docs/data/mock-data-persons.json',
)
