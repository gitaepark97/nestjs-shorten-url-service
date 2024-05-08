import { check } from "k6";
import http from "k6/http";

export const options = {
  duration: "1s",
};

const BASE_URL = "http://localhost:3000/api/v1";

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

  const response = http.get(url, params);
  check(response, {
    success: (res) => res.status === 302,
  });
}
