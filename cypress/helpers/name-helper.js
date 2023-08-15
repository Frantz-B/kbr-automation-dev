/* eslint-disable max-len */
// Generates a unique name with the current timestamp and a suffix

const dayjs = require('dayjs');

// You should pass in the entity name like 'Ad'
exports.generateName = (suffix) => {
  const name = `${dayjs().format('YY.MM.DD_hh:mm:ss')}-${suffix}`;
  return name;
};

exports.generateRandomNum = maxNumber => Math.floor(Math.random() * maxNumber);

// Returns an integer random number between min (included) and max (included):
exports.generateRandomNumBetween = (minNumber, maxNumber) => Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber;
