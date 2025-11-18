// createRandomName.cjs
import { faker } from '@faker-js/faker';

function createRandomMaleFirstName() {
  return faker.person.firstName('male');
}

function createRandomMaleLastName() {
  return faker.person.lastName('male');
}

// alias if you also call it "createRandomLastName" elsewhere
const createRandomLastName = createRandomMaleLastName;

function createRandomName() {
  return `${createRandomMaleFirstName()} ${createRandomMaleLastName()}`;
}

// CommonJS named exports:
module.exports = {
  createRandomMaleFirstName,
  createRandomMaleLastName,
  createRandomLastName,
  createRandomName,
};
