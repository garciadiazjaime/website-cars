import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Table, Input, Space, Button } from "antd";
import Highlighter from "react-highlight-words";
import TagManager from "react-gtm-module";

const tagManagerArgs = {
  gtmId: "GTM-527VHWHN",
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const fetchCars = async () => {
    const response = await fetch("/cars.json");
    const data = await response.json();

    setCars(data);
    setLoading(false);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text, record) =>
      searchedColumn === dataIndex ? (
        <a href={record.link} target="_blank" style={{ color: "black" }}>
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ""}
          />
        </a>
      ) : (
        <a href={record.link} target="_blank" style={{ color: "black" }}>
          {text}
        </a>
      ),
  });

  const columns = [
    {
      title: "#",
      render: (_, _record, index) => index + 1,
    },
    {
      title: "Title",
      dataIndex: "title",
      ...getColumnSearchProps("title"),
    },
    {
      title: "Price",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => formatter.format(price),
    },
    {
      title: "Year",
      dataIndex: "year",
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: "VIN",
      dataIndex: "vin",
    },
    {
      title: "Mileage",
      dataIndex: "mileage",
      sorter: (a, b) => a.mileage - b.mileage,
    },
  ];

  const initGA = () => {
    TagManager.initialize(tagManagerArgs);
  };

  useEffect(() => {
    fetchCars();
    initGA();
  }, []);

  return (
    <div>
      <Head>
        <title>Cars</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Cars</h1>
        <Table
          rowKey="vin"
          columns={columns}
          dataSource={cars}
          size="large"
          pagination={{ pageSize: 100 }}
          loading={loading}
        />
      </main>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>

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
