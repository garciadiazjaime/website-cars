const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const puppeteer = require("puppeteer");

const extractHTML = async (url) => {
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

const getExtractor = (site) => {
  if (site.mapper) {
    if (site.ssl) {
      return extractSSL;
    }

    return extractHTML;
  }

  return extractJSON;
};

const toNumber = (value) => Number(value.replace(/[^0-9.]+/g, ""));

const mapperA = () => ({
  selector: ".vehicle-content",
  run: ($, item) => {
    const title = $(item).find("h2").text().trim();
    const price = toNumber($(item).find(".payment-section").text().trim());
    const year = title.slice(0, 4);
    const link = $(item).find("a").first().attr("href");
    const vin = $(item).find("#copy_vin").text().trim();
    const mileage = toNumber($(item).find(".mileage").text().trim());

    return {
      title,
      price,
      year,
      link,
      vin,
      mileage,
    };
  },
});

const mapperB = () => ({
  selector: "#hits > div",
  run: ($, item) => {
    const data = $(item).data("vehicle");

    const title = `${data.year} ${data.make} ${data.model} ${data.trim}`;
    const price = data.price;
    const year = data.year;
    const link = $(item).find(".hit-link").first().attr("href");
    const vin = data.vin;
    const mileage = toNumber($(item).find(".mileage").text().trim());

    return {
      title,
      price,
      year,
      link,
      vin,
      mileage,
    };
  },
});

const mapperC = () => ({
  selector: ".standard-inventory",
  run: ($, item) => {
    const title = $(item).find(".vehiclebox-title h2").text().trim();
    const price = toNumber(
      $(item).find(".payment-section div div").text().trim()
    );
    const year = title.slice(0, 4);
    const link = $(item).find(">a").first().attr("href");
    const vin = $(item).find("#copy_vin").text().trim();
    const mileage = toNumber($(item).find(".mileage").text().trim());

    return {
      title,
      price,
      year,
      link,
      vin,
      mileage,
    };
  },
});

const mapperD = () => ({
  selector: ".vehicle_item",
  run: ($, item) => {
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

    return {
      title,
      price,
      year,
      link,
      vin,
      mileage,
    };
  },
});

const getMapper = (mapperType) => {
  const mappers = {
    A: mapperA,
    B: mapperB,
    C: mapperC,
    D: mapperD,
  };

  return mappers[mapperType.toUpperCase()];
};

const transformHTML = (html, mapperType) => {
  const mapper = getMapper(mapperType);
  const config = mapper();

  const $ = cheerio.load(html);
  const cars = [];

  $(config.selector)
    .toArray()
    .map((item) => cars.push(config.run($, item)));

  return cars;
};

const transformJSON = (data) => {
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

const main = async () => {
  const sites = [
    {
      url: "https://www.dtvwchicago.com/inventory/used?mileagemin=0&mileagemax=50000&sorttype=priceltoh",
      mapper: "A",
    },
    {
      url: "https://www.cityvwchicago.com/used-vehicles/?idx=low_to_high&_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=61196&_paymentType=our_price",
      cookies: [
        {
          name: "__cf_bm",
          value:
            "DP0yifqzXU1EWIzV9wXV0LnJMCdGmjx2dxI9DQ_wcLc-1688336250-0-AXw6eb8z3/BZeDHzNeTn0yw90I5FsfwnTbkVQHRd3b9zlz/aeER8/0XrLhNoRbwD/+bfQ9V0qX2iCnprLUIZYF0tpJLtdXSO+K85uzg9o/7j",
          domain: ".www.cityvwchicago.com",
        },
      ],
      mapper: "B",
      ssl: true,
    },
    {
      url: "https://www.vwofchicagoland.com/used-vehicles/?_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=66827&_paymentType=our_price",
      cookies: [
        {
          name: "__cf_bm",
          value:
            "0buvSZynH.y1b06ypuzisOR3633OUUKGUSC2NQxlZs8-1688336298-0-AalHgnR2W9Eo/w2FAWqNGPWgNHdyqVQ2KBm+NseRVnS8rAOHNzMh14fB52A6PsBJeiu/ahIVV5qaJG9GXOqN+hKkAlvAPcGGKv+qo/aLni86",
          domain: "www.vwofchicagoland.com",
        },
      ],
      mapper: "B",
      ssl: true,
    },
    {
      url: "https://www.foxvalleyvw.com/used-vehicles/?_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=57424&_paymentType=our_price",
      cookies: [
        {
          name: "__cf_bm",
          value:
            "_IDpFgbyw9fJJkLD2eYPppJaJGqFkuh7_oVnL04LTjw-1688336335-0-AVhBIo+AahTlkCSS8d7tTY72NeO9QKJ3TB0HIwYAqmWTI2uk0zc3N9LgnmFu4tVatHobaNbYGTBh3WZ4QOhcqHV6GVrtA/Rc3QJN0GF9shK9",
          domain: ".www.foxvalleyvw.com",
        },
      ],
      mapper: "B",
      ssl: true,
    },
    {
      url: "https://www.larryroeschvw.com/used-vehicles/?_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=55149&_paymentType=our_price",
      cookies: [
        {
          name: "__cf_bm",
          value:
            "C1nERY7IsTdSzygn5P2c8_QnR_JVCDYZmeXytUHW6ws-1688336371-0-AbDfLCRmtndLjR7iV3rmxzlKif4R9sWN7K0+iQL/DoQU6cVGNStUV8j4RDK5+K629w1lRAQu0J8qHosIVsy+xGdTu5WssPqGlSCs3IICvR9o",
          domain: ".www.larryroeschvw.com",
        },
      ],
      mapper: "B",
      ssl: true,
    },
    {
      url: "https://www.pugivolkswagen.com/used-vehicles/?idx=low_to_high&_dFR%5Bmake%5D%5B0%5D=Volkswagen&_dFR%5Btype%5D%5B0%5D=Used&_dFR%5Btype%5D%5B1%5D=Certified%2520Used&_nR%5Bmiles%5D%5B%3C=%5D%5B0%5D=52110&_paymentType=our_price",
      cookies: [
        {
          name: "__cf_bm",
          value:
            "liIhuutTv_3FUoMyUTBSwUVOknwFQJooGwDyBCvx5EQ-1688336400-0-AQYzQKPlqZ701pId16SrwLMInqGfRD6/GTyw0HZTDsQNxfJBRucyDTuqa7aJklTxpm9Nt2eXSzBJPc9jieno6qaERlFLBKdBEkSbzxZ+8udY",
          domain: ".www.pugivolkswagen.com",
        },
      ],
      mapper: "B",
      ssl: true,
    },
    {
      url: "https://www.vwoaklawn.com/inventory/used/volkswagen?instock=true&intransit=true&mileagemin=556&mileagemax=60000&sorttype=priceltoh",
      mapper: "C",
    },
    {
      url: "https://vworland.com/inventory/used/volkswagen?instock=true&intransit=true&mileagemin=556&mileagemax=55753&sorttype=priceltoh",
      mapper: "C",
    },
    {
      url: "https://www.hawkvw.com/search/pre-owned-volkswagen-joliet-il/?s:pr=1&cy=60435&mk=64&ml=0:55000&tp=pre_owned",
      mapper: "D",
      ssl: true,
    },
    {
      url: "https://www.gurneevw.com/apis/widget/INVENTORY_LISTING_DEFAULT_AUTO_USED:inventory-data-bus1/getInventory?make=Volkswagen&odometer=0-60000&year=2015-2023&sortBy=internetPrice%20asc",
    },
  ];

  const promises = sites.map(async (site) => {
    const extract = getExtractor(site);
    const response = await extract(site.url, site.cookies);

    const cars = site.mapper
      ? transformHTML(response, site.mapper)
      : transformJSON(response);

    const url = new URL(site.url);
    console.log(`${url.host}: ${cars.length} found`);

    return cars;
  });

  const cars = [];
  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    cars.push(...response);
  });

  console.log(`${cars.length} found`);
  load(cars);
};

main().then(() => {
  console.log("end");
});
