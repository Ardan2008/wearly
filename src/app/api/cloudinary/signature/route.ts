import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { requireAnyRole } from "@/lib/auth-guard";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAnyRole(["OWNER", "ADMIN"]);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { message: "Konfigurasi Cloudinary belum lengkap." },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "wearly/products";
    const allowedFormats = "jpg,png,webp";

    const signature = cloudinary.utils.api_sign_request(
    {
        timestamp,
        folder,
        allowed_formats: allowedFormats,
    },
        apiSecret
    );

    return NextResponse.json({
        timestamp,
        folder,
        signature,
        cloudName,
        apiKey,
        allowedFormats,
    });
  } catch (error) {
    console.error("Cloudinary signature error:", error);

    return NextResponse.json(
      { message: "Gagal membuat upload signature." },
      { status: 500 }
    );
  }
}