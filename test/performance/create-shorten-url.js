import { check } from "k6";
import http from "k6/http";

export const options = {
  duration: "1s",
};

const BASE_URL = "http://localhost:8000/api/v1";

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
