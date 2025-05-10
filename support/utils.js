const fs = require("fs");

const extractHTML = async (url) => {
  const response = await fetch(url);

  return await response.text();
};

const extractJSON = async (url) => {
  const response = await fetch(url);

  return await response.json();
};

const toNumber = (value) => Number(value.replace(/[^0-9.]+/g, ""));

const load = (cars, name) => {
  fs.writeFileSync(`./_sites/${name}.json`, JSON.stringify(cars));
};

const logger = (...args) => {
  console.log(...args);
};

const getDomain = (url) => {
  const domain = url.match(/https?:\/\/(www\.)?([^\/]+)/)[2];
  return domain;
};

module.exports = {
  extractHTML,
  extractJSON,
  toNumber,
  load,
  logger,
  getDomain,
};
