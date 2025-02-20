import type { NextApiRequest, NextApiResponse } from "next";
import axios, { Method } from "axios";

interface APIResponse<T> {
  status: string;
  token?: string;
  data?: T;
  message?: string;
}

export default async function apiHandler<T>(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<T>>,
  endpoint: string,
  method: Method
) {
  if (req.method !== method) {
    return res.status(405).json({ status: "error", message: "Method Not Allowed" });
  }

  try {
    const backendResponse = await axios.request<APIResponse<T>>({
      url: `${process.env.BASE_API_URL}/${endpoint}`,
      method,
      data: req.body,
      headers: { "Content-Type": "application/json" },
    });

    res.status(200).json(backendResponse.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      status: "error",
      message: error.response?.data?.message || "Internal Server Error",
    });
  }
}