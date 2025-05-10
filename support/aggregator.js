const fs = require("fs");
const path = require("path");
const { logger } = require("./utils");

const createSiteFolder = () => {
  const outputDir = path.join(__dirname, "../_sites");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
};

const createJSONFiles = async () => {
  const sitesDir = path.join(__dirname, "../sites");
  const files = fs.readdirSync(sitesDir);

  for (const file of files) {
    if (file.endsWith(".js")) {
      const siteModule = await import(path.join(sitesDir, file));

      if (typeof siteModule.default === "function") {
        await siteModule.default();
      }
    }
  }
};

const importAndSortJSONFiles = () => {
  const sitesDir = path.join(__dirname, "../_sites");
  const files = fs.readdirSync(sitesDir);

  let allCars = [];

  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = path.join(sitesDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      allCars = allCars.concat(data);
    }
  }

  allCars.sort((a, b) => a.price - b.price);

  logger(`Total cars: ${allCars.length}`);

  fs.writeFileSync(`./public/cars.json`, JSON.stringify(allCars));
};

const main = async () => {
  //   createSiteFolder();

  //   await createJSONFiles();
  await importAndSortJSONFiles();
};

main()
  .then(() => {
    logger("All sites loaded successfully");
  })
  .catch((err) => {
    logger(err);
  });
