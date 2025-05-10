'use client';

import { useEffect, useState } from "react";
import TagManager from "react-gtm-module";
import cars from "../public/cars.json";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatterNumber = new Intl.NumberFormat("en-Us", {
  maximumSignificantDigits: 3,
});

const styles = {
  colors: {
    primary: "#001e50",
    gray: "#f5f5f5",
  },
  container: {
    maxWidth: 1080,
    margin: "0 auto",
  },
};

interface Car {
  title: string;
  price: number;
  year: number;
  link: string;
  vin: string;
  mileage: number;
}

export default function Home() {
  const [priceFilter, setPriceFilter] = useState(23_000);
  const [yearFilter, setYearFilter] = useState(2020);
  const [textFilter, setTextFilter] = useState("jetta");
  const [mileageFilter, setMileageFilter] = useState(20_000);
  const [filteredCars, setFilteredCars] = useState<Car[]>(cars as unknown as Car[]);

  const initGA = () => {
    TagManager.initialize({
      gtmId: "GTM-527VHWHN",
    });
  };

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    let filtered = cars;
    if (priceFilter) {
      filtered = filtered.filter((car) => car.price <= priceFilter);
    }
    if (yearFilter) {
      filtered = filtered.filter((car) => car.year as number >= yearFilter);
    }
    if (textFilter) {
      filtered = filtered.filter((car) =>
        car.title.toLowerCase().includes(textFilter.toLowerCase())
      );
    }
    if (mileageFilter) {
      filtered = filtered.filter((car) => car.mileage <= mileageFilter);
    }
    setFilteredCars(filtered as unknown as Car[]);
  }, [priceFilter, yearFilter, textFilter, mileageFilter]);

  return (
    <div style={{ backgroundColor: styles.colors.gray }}>
      <header
        style={{
          backgroundColor: styles.colors.primary,
          color: "white",
          padding: 12,
        }}
      >
        <div style={styles.container}>
          <h1>Volkswagen Jetta Chicago</h1>
        </div>
      </header>

      <main style={styles.container}>
        <div style={{ marginTop: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="priceFilter" style={{ marginRight: 10 }}>
              Filter by Price (below):
            </label>
            <input
              id="priceFilter"
              type="number"
              value={priceFilter}
              onChange={(e) => setPriceFilter(+e.target.value)}
              placeholder="Enter max price"
              style={{
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
          </div>

          {/* Input field for year filter */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="yearFilter" style={{ marginRight: 10 }}>
              Filter by Year (greater than):
            </label>
            <input
              id="yearFilter"
              type="number"
              value={yearFilter}
              onChange={(e) => setYearFilter(+e.target.value)}
              placeholder="Enter minimum year"
              style={{
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
          </div>

          {/* Input field for text filter */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="textFilter" style={{ marginRight: 10 }}>
              Filter by Text:
            </label>
            <input
              id="textFilter"
              type="text"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder="Enter text to filter"
              style={{
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
          </div>

          {/* Input field for mileage filter */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="mileageFilter" style={{ marginRight: 10 }}>
              Filter by Mileage (below):
            </label>
            <input
              id="mileageFilter"
              type="number"
              value={mileageFilter}
              onChange={(e) => setMileageFilter(+e.target.value)}
              placeholder="Enter max mileage"
              style={{
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
          </div>

          <div style={{ display: "flex", padding: 20, fontWeight: "bold" }}>
            <div style={{ width: 40 }}>#</div>
            <div style={{ flex: 2 }}>Car</div>
            <div style={{ flex: 1 }}>Price</div>
            <div style={{ flex: 1 }}>Year</div>
            <div style={{ flex: 1 }}>Mileage</div>
          </div>
          {filteredCars
            .sort((a, b) => a.price - b.price)
            .slice(0, 150)
            .map((car, index) => (
              <div
                key={car.vin}
                data-vin={car.vin}
                style={{
                  display: "flex",
                  borderBottom: "1px solid black",
                  padding: 20,
                }}
              >
                <div style={{ width: 40 }}>{index + 1}</div>
                <div style={{ flex: 2 }}>
                  <a href={car.link} target="_blank" rel="nofollow" style={{ textDecoration: 'underline' }}>
                    {car.title}
                  </a>
                </div>
                <div style={{ flex: 1 }}>{formatter.format(car.price)}</div>
                <div style={{ flex: 1 }}>{car.year}</div>
                <div style={{ flex: 1 }}>
                  {formatterNumber.format(car.mileage)}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
