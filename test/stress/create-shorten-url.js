import http from "k6/http";

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "10s", target: 100 },
    { duration: "10s", target: 1000 },
  ],
};

const BASE_URL = "http://localhost:8000/api/v1";

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

  http.post(postUrl, payload, postParams);
}
