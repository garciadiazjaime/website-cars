const { load, logger } = require("../support/utils");

const transform = (data) => {
  return data.results[0].hits.reduce((cars, item) => {
    cars.push({
      title: `${item.make} ${item.model} ${item.trim}`,
      price: item.our_price,
      year: item.year,
      link: item.link,
      vin: item.vin,
      mileage: item.miles,
    });

    return cars;
  }, []);
};

const main = async () => {
  const site = {
    url: "https://2591j46p8g-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia%20for%20JavaScript%20(4.9.1)%3B%20Browser%20(lite)%3B%20JS%20Helper%20(3.22.4)&x-algolia-api-key=78311e75e16dd6273d6b00cd6c21db3c&x-algolia-application-id=2591J46P8G",
    name: "cityvwofchicago.com",
  };
  const name = site.name;
  logger(`processing: ${name}`);

  const response = await fetch(site.url, {
    body: '{"requests":[{"indexName":"cityvolkswagenofchicagoo_production_inventory_low_to_high","params":"facetFilters=%5B%5B%22make%3AVolkswagen%22%5D%2C%5B%22type%3ACertified%20Used%22%2C%22type%3AUsed%22%5D%5D&facets=%5B%22Location%22%2C%22algolia_sort_order%22%2C%22api_id%22%2C%22bedtype%22%2C%22body%22%2C%22certified%22%2C%22city_mpg%22%2C%22custom_sort_location%22%2C%22cylinders%22%2C%22date_in_stock%22%2C%22date_modified%22%2C%22days_in_stock%22%2C%22doors%22%2C%22drivetrain%22%2C%22engine_description%22%2C%22ext_color%22%2C%22ext_color_generic%22%2C%22ext_options%22%2C%22features%22%2C%22features%22%2C%22finance_details%22%2C%22ford_SpecialVehicle%22%2C%22fueltype%22%2C%22hash%22%2C%22hw_mpg%22%2C%22in_transit_filter%22%2C%22int_color%22%2C%22int_options%22%2C%22lease_details%22%2C%22lightning%22%2C%22lightning.class%22%2C%22lightning.finance_monthly_payment%22%2C%22lightning.isPolice%22%2C%22lightning.isSpecial%22%2C%22lightning.lease_monthly_payment%22%2C%22lightning.locations%22%2C%22lightning.locations.meta_location%22%2C%22lightning.status%22%2C%22link%22%2C%22location%22%2C%22make%22%2C%22metal_flags%22%2C%22miles%22%2C%22model%22%2C%22model_number%22%2C%22msrp%22%2C%22objectID%22%2C%22our_price%22%2C%22our_price_label%22%2C%22special_field_1%22%2C%22stock%22%2C%22thumbnail%22%2C%22title_vrp%22%2C%22transmission_description%22%2C%22trim%22%2C%22type%22%2C%22vin%22%2C%22year%22%5D&hitsPerPage=20&maxValuesPerFacet=250&numericFilters=%5B%22miles%3C%3D45950%22%5D"},{"indexName":"cityvolkswagenofchicagoo_production_inventory_low_to_high","params":"analytics=false&clickAnalytics=false&facetFilters=%5B%5B%22type%3ACertified%20Used%22%2C%22type%3AUsed%22%5D%5D&facets=make&hitsPerPage=0&maxValuesPerFacet=250&numericFilters=%5B%22miles%3C%3D45950%22%5D&page=0"},{"indexName":"cityvolkswagenofchicagoo_production_inventory_low_to_high","params":"analytics=false&clickAnalytics=false&facetFilters=%5B%5B%22make%3AVolkswagen%22%5D%2C%5B%22type%3ACertified%20Used%22%2C%22type%3AUsed%22%5D%5D&facets=miles&hitsPerPage=0&maxValuesPerFacet=250&page=0"},{"indexName":"cityvolkswagenofchicagoo_production_inventory_low_to_high","params":"analytics=false&clickAnalytics=false&facetFilters=%5B%5B%22make%3AVolkswagen%22%5D%5D&facets=type&hitsPerPage=0&maxValuesPerFacet=250&numericFilters=%5B%22miles%3C%3D45950%22%5D&page=0"}]}',
    method: "POST",
  });

  const data = await response.json();

  const cars = transform(data);

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
