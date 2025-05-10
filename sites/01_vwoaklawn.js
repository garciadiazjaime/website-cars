const {
  extractJSON,
  toNumber,
  load,
  logger,
  getDomain,
} = require("../support/utils");

const transform = (data) => {
  return data.DisplayCards.reduce((cars, item) => {
    if (item.IsAdCard) {
      return cars;
    }

    const { VehicleCard } = item;
    cars.push({
      title: VehicleCard.VehicleName,
      price: VehicleCard.VehicleInternetPrice,
      year: VehicleCard.VehicleYear,
      link: VehicleCard.VehicleDetailUrl,
      vin: VehicleCard.VehicleVin,
      mileage: toNumber(VehicleCard.Mileage),
    });

    return cars;
  }, []);
};

const main = async () => {
  const site = {
    url: "https://www.vwoaklawn.com/api/vhcliaa/vehicle-pages/cosmos/srp/vehicles/25795/2631261?st=Price+asc&Make=Volkswagen&mileagerange=0-50000&host=www.vwoaklawn.com&baseFilter=dHlwZT0ndSc=&displayCardsShown=NaN",
  };
  const name = getDomain(site.url);
  logger(`processing: ${name}`);

  const data = await extractJSON(site.url);

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
