import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import TagManager from "react-gtm-module";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const getStaticProps = async () => {
  const res = await fetch(
    "https://volkswagen-chicago.mintitmedia.com/cars.json"
  );
  const cars = await res.json();
  return { props: { cars } };
};

export default function Home({ cars }) {
  const initGA = () => {
    TagManager.initialize({
      gtmId: "GTM-527VHWHN",
    });
  };

  useEffect(() => {
    initGA();
  }, []);

  return (
    <div>
      <Head>
        <title>Volkswagen Chicago</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Volkswagen Chicago</h1>
        {cars
          .sort((a, b) => a.price - b.price)
          .map((car, index) => (
            <div
              key={car.vin}
              style={{
                display: "flex",
                borderBottom: "1px solid black",
                padding: 20,
                display: "flex",
              }}
            >
              <div style={{ flex: 1 }}>{index + 1}</div>
              <div style={{ flex: 1 }}>{car.title}</div>
              <div style={{ flex: 1 }}>{formatter.format(car.price)}</div>
              <div style={{ flex: 1 }}>{car.year}</div>
              <div style={{ flex: 1 }}>{car.mileage}</div>
              <div style={{ flex: 1 }}>{car.vin}</div>
            </div>
          ))}
      </main>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
