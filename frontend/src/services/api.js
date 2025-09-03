import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

export const summarizeText = async (text) => {
  const res = await API.post("/ai/summarize", { text });
  return res.data;
};
