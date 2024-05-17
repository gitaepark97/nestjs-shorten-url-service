import { check } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "10s", target: 50 },
  ],
};

const BASE_URL = "http://localhost:8000/api/v1";

export default function () {
  const url = `${BASE_URL}/shorten-urls?pageNumber=10`;

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = http.get(url, params);
  check(response, {
    success: (res) => res.status === 200,
  });
}
