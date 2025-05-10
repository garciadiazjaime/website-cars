const cheerio = require("cheerio");

const {
  extractHTML,
  toNumber,
  load,
  logger,
  getDomain,
} = require("../support/utils");

const transform = (html) => {
  const $ = cheerio.load(html);

  return $('.vehicles-section script[type="application/ld+json"]')
    .toArray()
    .map((script) => {
      const jsonData = JSON.parse($(script).html());

      return {
        title: jsonData.name.trim(),
        price: toNumber(jsonData.offers.price),
        year: jsonData.vehicleModelDate,
        link: jsonData.offers.url,
        vin: jsonData.vehicleIdentificationNumber,
        mileage: toNumber(jsonData.mileageFromOdometer.value),
      };
    });
};

const main = async () => {
  const site = {
    url: "https://www.vwofchicagoland.com/inventory/used/volkswagen?paymenttype=cash&intransit=true&instock=true&inproduction=true&mileagemin=1478&mileagemax=50000&sorttype=priceltoh",
  };
  const name = getDomain(site.url);
  logger(`processing: ${name}`);

  const html = await extractHTML(site.url);

  const cars = transform(html);

  load(cars, name);

  logger(`${name}: ${cars.length}`);
};

if (require.main === module) {
  main()
    .then(() => {})
    .catch((err) => {
      logger(err);
    });
}

module.exports = main;
