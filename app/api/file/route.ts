import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { NextResponse } from "next/server";

async function downloadFile(url: string, directoryPath: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file. Status: ${response.status}`);
  }

  const fileBuffer = await response.buffer();

  const fileName = path.basename(new URL(url).pathname);

  const filePath = path.join(directoryPath, fileName);

  if (fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, fileBuffer);
  } else {
    return "";
  }

  return filePath;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchParam = new URLSearchParams(url.searchParams);
  const fileUrl = searchParam.get("fileUrl");

  let pathUrl = "uploads/pdfs";

  // const downloadDirectory = path.join(pathUrl);
  const pdfUrl = fileUrl + ".pdf";
  try {
    // Download the file and get the file path
    const filePath = await downloadFile(pdfUrl, pathUrl);
    if (filePath) {
      return NextResponse.json(filePath, { status: 200 });
    } else {
      return NextResponse.json("File not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(error, { status: 400 });
  }
}
