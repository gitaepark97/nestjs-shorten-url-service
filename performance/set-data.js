import { check } from "k6";
import http from "k6/http";

export const options = {
  vus: 1000,
  iterations: 100000,
};

const BASE_URL = "https://shorten-url-service.studiohugo.net/api/v1";

export default function () {
  const url = `${BASE_URL}/shorten-urls`;

  const payload = JSON.stringify({
    originalUrl: "https://www.google.co.kr",
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.post(url, payload, params);
  check(response, {
    success: (res) => res.status === 201,
  });
}
