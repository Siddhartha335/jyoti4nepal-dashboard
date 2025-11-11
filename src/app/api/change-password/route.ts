import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") || localStorage.getItem("token");
    
    if (!token) {
      return NextResponse.json(
        { status: "false", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { oldPassword, password } = body;

    // Forward the request to your backend
    const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendURL}/api/v1/user/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: "false", message: data.message || "Failed to change password" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { status: "true", message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { status: "false", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}