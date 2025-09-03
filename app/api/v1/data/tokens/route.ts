import { GET_TOKEN_DATA } from "@/app/utils/urls";
import { NextRequest } from "next/server";

const Auth = `Basic ${Buffer.from(
  `${process.env.NEXT_PUBLIC_ZAPPER_API_KEY}:`,
  "binary"
).toString("base64")}`;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    
    if (!address) {
      return Response.json(
        { message: "Address parameter is required" },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_ZAPPER_API_KEY || process.env.NEXT_PUBLIC_ZAPPER_API_KEY === "your_zapper_api_key_here") {
      console.warn("Zapper API key not configured, returning empty data");
      return Response.json(
        { [address.toLowerCase()]: [] },
        { status: 200 }
      );
    }

    const response = await fetch(`${GET_TOKEN_DATA}${address}`, {
      headers: {
        accept: "*/*",
        Authorization: Auth,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return Response.json(data, { status: 200 });
    } else {
      console.error("Zapper API error:", response.status, response.statusText);
      return Response.json(
        { message: "Failed to fetch token data" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Token API error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
