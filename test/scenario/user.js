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
  const postUrl = `${BASE_URL}/shorten-urls`;

  const payload = JSON.stringify({
    originalUrl: "https://www.google.co.kr",
  });
  const postParams = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(postUrl, payload, postParams);
  const shortenUrlKey = JSON.parse(response.body).key;

  const getUrl = `${BASE_URL}/shorten-urls/${shortenUrlKey}`;

  const getParams = {
    headers: {
      "Content-Type": "application/json",
    },
    redirects: 0,
  };

  for (let i = 0; i < 10; i++) {
    http.get(getUrl, getParams);
  }
}
