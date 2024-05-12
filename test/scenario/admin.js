import http from "k6/http";

export const options = {
  stages: [
    { duration: "1m", target: 1 },
    { duration: "3m", target: 2 },
    { duration: "1m", target: 3 },
    { duration: "1m", target: 10 },
    { duration: "3m", target: 5 },
    { duration: "3m", target: 10 },
    { duration: "1m", target: 30 },
    { duration: "1m", target: 30 },
    { duration: "3m", target: 20 },
    { duration: "3m", target: 20 },
    { duration: "2m", target: 0 },
  ],
};

const BASE_URL = "https://shorten-url-service.studiohugo.net/api/v1";

export default function () {
  const randomPageNumber = Math.floor(Math.random() * 100) + 1;
  const url = `${BASE_URL}/shorten-urls?pageNumber=${randomPageNumber}`;

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  http.get(url, params);
}
