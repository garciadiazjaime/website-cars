const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const puppeteer = require("puppeteer");

const extract = async (url) => {
  const response = await fetch(url);

  return await response.text();
};

const extractJSON = async (url) => {
  const response = await fetch(url);

  return await response.json();
};

const extractSSL = async (url, cookies = []) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  await page.setCookie(...cookies);

  await page.goto(url, { waitUntil: "networkidle0" });

  await page.screenshot({
    path: "screenshot.jpg",
  });

  const html = await page.content();

  await browser.close();

  return html;
};

const toNumber = (value) => Number(value.replace(/[^0-9.]+/g, ""));

const transform = (html) => {
  const $ = cheerio.load(html);
  const cars = [];

  $(".vehicle-content")
    .toArray()
    .map((item) => {
      const title = $(item).find("h2").text().trim();
      const price = toNumber($(item).find(".payment-section").text().trim());
      const year = title.slice(0, 4);
      const link = $(item).find("a").first().attr("href");
      const vin = $(item).find("#copy_vin").text().trim();
      const mileage = toNumber($(item).find(".mileage").text().trim());

      cars.push({
        title,
        price,
        year,
        link,
        vin,
        mileage,
      });
    });

  return cars;
};

const transform2 = (html) => {
  const $ = cheerio.load(html);
  const cars = [];

  $("#hits > div")
    .toArray()
    .map((item) => {
      const data = $(item).data("vehicle");

      const title = `${data.year} ${data.make} ${data.model} ${data.trim}`;
      const price = data.price;
      const year = data.year;
      const link = $(item).find(".hit-link").first().attr("href");
      const vin = data.vin;
      const mileage = toNumber($(item).find(".mileage").text().trim());

      cars.push({
        title,
        price,
        year,
        link,
        vin,
        mileage,
      });
    });

  return cars;
};

const transform3 = (html) => {
  const $ = cheerio.load(html);
  const cars = [];

  $(".standard-inventory")
    .toArray()
    .map((item) => {
      const title = $(item).find(".vehiclebox-title h2").text().trim();
      const price = toNumber(
        $(item).find(".payment-section div div").text().trim()
      );
      const year = title.slice(0, 4);
      const link = $(item).find(">a").first().attr("href");
      const vin = $(item).find("#copy_vin").text().trim();
      const mileage = toNumber($(item).find(".mileage").text().trim());

      cars.push({
        title,
        price,
        year,
        link,
        vin,
        mileage,
      });
    });

  return cars;
};

const transform4 = (html) => {
  const $ = cheerio.load(html);
  const cars = [];

  $(".vehicle_item")
    .toArray()
    .map((item) => {
      const title = $(item).find(".vehicle_title").text().trim();
      const price = $(item)
        .find(".capital-one-prequalification-button")
        .data("sales-price");
      const year = $(item)
        .find(".capital-one-prequalification-button")
        .data("year");
      const href = $(item).find(".vehicle_title a").attr("href");
      const link = `https://www.hawkvw.com/${href}`;
      const vin = $(item)
        .find(".capital-one-prequalification-button")
        .data("vin");
      const mileage = $(item)
        .find(".capital-one-prequalification-button")
        .data("mileage");

      cars.push({
        title,
        price,
        year,
        link,
        vin,
        mileage,
      });
    });

  return cars;
};

const transform5 = (data) => {
  const cars = [];

  data.pageInfo.trackingData.map((item) => {
    const title = `${item.modelYear} ${item.make} ${item.model} ${item.trim}`;
    const price = toNumber(item.internetPrice || item.askingPrice);
    const year = item.modelYear;
    const href = item.link;
    const link = `https://www.gurneevw.com${href}`;
    const vin = item.vin;
    const mileage = item.odometer;

    if (!price) {
      console.log("no price", link);
      return;
    }

    cars.push({
      title,
      price,
      year,
      link,
      vin,
      mileage,
    });
  });

  return cars;
};

const load = (cars) => {
  fs.writeFileSync("./public/cars.json", JSON.stringify(cars));
};

const dtvwchicagoETL = async () => {
  const url =
    "https://www.dtvwchicago.com/inventory/used?mileagemin=0&mileagemax=50000&sorttype=priceltoh";

  const html = await extract(url);

  const cars = transform(html);

  console.log(`dtvwchicagoETL: ${cars.length} found`);

  return cars;
};

const cityvwchicagoETL = async () => {
  const url =
    "https://www.cityvwchicago.com/used-vehicles/?idx=low_to_high&_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=61196&_paymentType=our_price";
  const cookies = [
    {
      name: "__cf_bm",
      value:
        "lj9Qf9maoqrmYSrxod4iiJ7a.gA1_1kMBHuHpajjj48-1688331192-0-AfjWaSjg29QJErD1pke+N/7ArA0HvnzaL3O5mrDvWhI4loAoW/ExSqA0hQ6vYyrnlnZM4AMlWDoKVS9i7PRovPO/F+7cuBcyOfGVvGqBvYYC",
      domain: ".www.cityvwchicago.com",
    },
  ];

  const html = await extractSSL(url, cookies);

  const cars = transform2(html);

  console.log(`cityvwchicago: ${cars.length} found`);

  return cars;
};

const vwofchicagolandETL = async () => {
  const url =
    "https://www.vwofchicagoland.com/used-vehicles/?_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=66827&_paymentType=our_price";
  const cookies = [
    {
      name: "__cf_bm",
      value:
        "r2y1ZXG9jwg7hYrgkKBrTWaRz8GW8WfndWeQGZkEll8-1688331270-0-AT2+7n0x1jcOnczXC8P82f6ZiKsAQZSGXt1WZmgf7kQ4o3IMVn1dv738uZAkaFYPZhgHrka42oYZfI3sMRNfJodU542WaXtf1A9Ag1r4UTj7",
      domain: "www.vwofchicagoland.com",
    },
  ];

  const html = await extractSSL(url, cookies);

  const cars = transform2(html);

  console.log(`vwofchicagoland: ${cars.length} found`);

  return cars;
};

const vwoaklawnETL = async () => {
  const url =
    "https://www.vwoaklawn.com/inventory/used/volkswagen?instock=true&intransit=true&mileagemin=556&mileagemax=60000&sorttype=priceltoh";

  const html = await extract(url);

  const cars = transform3(html);

  console.log(`vwoaklawn: ${cars.length} found`);

  return cars;
};

const foxvalleyvwETL = async () => {
  const url =
    "https://www.foxvalleyvw.com/used-vehicles/?_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=57424&_paymentType=our_price";
  const cookies = [
    {
      name: "__cf_bm",
      value:
        "adkEK1QE4KE9VhMp1URX8m5kGp4yfgqTOPxQSHx3Q4s-1688331314-0-AUAhyPLnK/Qh25K1uJ+PYvw2YQtOQ/jazVWXtAKsMFpxA+jdMcxENCDQ1Q6c/idnRtxPlM5rn2J3wiYVUNA4PWekjPcwm9KGudCxIgS122wA",
      domain: ".www.foxvalleyvw.com",
    },
  ];

  const html = await extractSSL(url, cookies);

  const cars = transform2(html);

  console.log(`foxvalleyvw: ${cars.length} found`);

  return cars;
};

const hawkvwETL = async () => {
  const url =
    "https://www.hawkvw.com/search/pre-owned-volkswagen-joliet-il/?s:pr=1&cy=60435&mk=64&ml=0:55000&tp=pre_owned";

  const html = await extractSSL(url);

  const cars = transform4(html);

  console.log(`hawkvwETL: ${cars.length} found`);

  return cars;
};

const vworlandETL = async () => {
  const url =
    "https://vworland.com/inventory/used/volkswagen?instock=true&intransit=true&mileagemin=556&mileagemax=55753&sorttype=priceltoh";

  const html = await extract(url);

  const cars = transform3(html);

  console.log(`vworlandETL: ${cars.length} found`);

  return cars;
};

const larryroeschvwETL = async () => {
  const url =
    "https://www.larryroeschvw.com/used-vehicles/?_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=55149&_paymentType=our_price";
  const cookies = [
    {
      name: "__cf_bm",
      value:
        "Nb04s2YZrrKSytVY9Q4FTgBL_KbszMN_a4WGlmCayWo-1688331452-0-AdToITzcmANfVsXVVIKmhDb+BCw+vWtMccsCeZOCyWjFGb9zwDzxcHmkRf7e6JP2u284x4Fbr3fSphqnU3Hy5+NnrdvWlvRG2yC4tBnLUSn5",
      domain: ".www.larryroeschvw.com",
    },
  ];

  const html = await extractSSL(url, cookies);

  const cars = transform2(html);

  console.log(`larryroeschvwETL: ${cars.length} found`);

  return cars;
};

const pugivolkswagenETL = async () => {
  const url =
    "https://www.pugivolkswagen.com/used-vehicles/?idx=low_to_high&_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=52110&_paymentType=our_price";
  const cookies = [
    {
      name: "__cf_bm",
      value:
        "7SF6VCTIeONatuBdpMEkwI._NC8FdkeCyYNUVa5nwiE-1688331375-0-AY9SmPwltef5pSry803MhW5E2QKjPKdfpj1LHv4nU6aXmg1QH6IPUZCWPQz/s/7Gqx1ZtmZ4PrpHqHZNzWGB9s2xEXEMWrwEt08YO3jIwnQN",
      domain: ".www.pugivolkswagen.com",
    },
  ];
  const html = await extractSSL(url, cookies);

  const cars = transform2(html);

  console.log(`pugivolkswagenETL: ${cars.length} found`);

  return cars;
};

const gurneevwETL = async () => {
  const url =
    "https://www.gurneevw.com/apis/widget/INVENTORY_LISTING_DEFAULT_AUTO_USED:inventory-data-bus1/getInventory?make=Volkswagen&odometer=0-60000&year=2015-2023&sortBy=internetPrice%20asc";

  const data = await extractJSON(url);

  const cars = transform5(data);

  console.log(`gurneevwETL: ${cars.length} found`);

  return cars;
};

const main = async () => {
  const cars1 = await dtvwchicagoETL();

  const cars2 = await cityvwchicagoETL();

  const cars3 = await vwofchicagolandETL();

  const cars4 = await vwoaklawnETL();

  const cars5 = await foxvalleyvwETL();

  const cars6 = await hawkvwETL();

  const cars7 = await vworlandETL();

  const cars8 = await larryroeschvwETL();

  const cars9 = await pugivolkswagenETL();

  const cars10 = await gurneevwETL();

  const cars = [
    ...cars1,
    ...cars2,
    ...cars3,
    ...cars4,
    ...cars5,
    ...cars6,
    ...cars7,
    ...cars8,
    ...cars9,
    ...cars10,
  ];
  console.log(`${cars.length} found`);
  load(cars);
};

main().then(() => {
  console.log("end");
});
