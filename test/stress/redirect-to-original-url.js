import http from "k6/http";

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "10s", target: 100 },
    { duration: "10s", target: 1000 },
    { duration: "10s", target: 4000 },
  ],
};

const BASE_URL = "http://localhost:8000/api/v1";

export function setup() {
  const url = `${BASE_URL}/shorten-urls?pageNumber=1`;

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.get(url, params);
  const shortenUrls = JSON.parse(response.body).shortenUrls;
  const randomIdx = Math.floor(Math.random() * shortenUrls.length);
  const shortenUrlKey = shortenUrls[randomIdx].key;
  return shortenUrlKey;
}

export default function (data) {
  const url = `${BASE_URL}/shorten-urls/${data}`;

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    redirects: 0,
  };

  http.get(url, params);
}
