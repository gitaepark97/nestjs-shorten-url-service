import { check } from "k6";
import http from "k6/http";

export const options = {
  duration: "1s",
};

const BASE_URL = "http://localhost:3000/api/v1";

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
