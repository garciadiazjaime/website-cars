import Head from "next/head";
import { useEffect } from "react";
import TagManager from "react-gtm-module";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const content = {
  title: "Best Price Volkswagen Jetta Cars in Chicago | Top Deals & Offers",
  description:
    "Find the best prices for Volkswagen Jetta cars in Chicago. Explore top deals and offers on Jetta models at our dealership. Drive home your dream car at the most competitive prices in Chicago.",
};

const styles = {
  colors: {
    primary: "#001e50",
  },
  container: {
    maxWidth: 1080,
    margin: "0 auto",
  },
};

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
    <div style={{ backgroundColor: styles.colors.gray }}>
      <Head>
        <title>{content.title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={content.description} />
      </Head>
      <header
        style={{
          backgroundColor: styles.colors.primary,
          color: "white",
          padding: 12,
        }}
      >
        <div style={styles.container}>
          <h1>Volkswagen Chicago</h1>
          <h2 style={{ fontWeight: "normal", opacity: 0.9 }}>
            Driving Value: Your Jetta Journey Starts Here!
          </h2>
        </div>
      </header>

      <main style={styles.container}>
        <div style={{ marginTop: 40 }}>
          {cars
            .slice(0, 50)
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
                <div style={{ flex: 1 }}>
                  <a href={car.link} target="_blank" rel="nofollow">
                    {car.title}
                  </a>
                </div>
                <div style={{ flex: 1 }}>{formatter.format(car.price)}</div>
                <div style={{ flex: 1 }}>{car.year}</div>
                <div style={{ flex: 1 }}>{car.mileage}</div>
                <div style={{ flex: 1 }}>{car.vin}</div>
              </div>
            ))}
        </div>

        <div style={{ margin: "100px 0" }}>
          <p>
            Looking for the best price on Volkswagen Jetta cars in Chicago? Look
            no further! Our inventory offers a wide range of Volkswagen Jetta
            models at unbeatable prices. Whether you're a first-time buyer or
            looking to upgrade your current vehicle, we have the perfect Jetta
            for you.
          </p>
          <p>
            Our experienced team is dedicated to providing you with exceptional
            customer service and helping you find the Jetta that suits your
            needs and budget. With our extensive inventory, you'll have plenty
            of options to choose from, ensuring you find the right features,
            colors, and specifications you desire.
          </p>
          <p>
            Don't miss out on the opportunity to own a Volkswagen Jetta at the
            best price in Chicago. Your dream Jetta is just a test drive away!
          </p>
        </div>
      </main>

      <footer
        style={{
          ...styles.container,
          borderTop: `2px solid ${styles.colors.primary}`,
          padding: "20px 0",
        }}
      >
        <strong>{content.title}</strong>
        <p>{content.description}</p>
      </footer>

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
