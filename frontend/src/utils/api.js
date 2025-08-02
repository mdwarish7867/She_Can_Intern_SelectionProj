import axios from "axios";
export default axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.REACT_APP_BACKEND_URL,
  },
});