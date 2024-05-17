"use server";

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

async function downloadFile(url: string, directoryPath: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file. Status: ${response.status}`);
  }

  const fileBuffer = await response.buffer();
  const fileName = path.basename(new URL(url).pathname);
  const filePath = path.join(directoryPath, fileName);

  fs.writeFileSync(filePath, fileBuffer);

  return filePath;
}

export async function deleteFileFromLocal(filePath: string) {
  fs.unlinkSync(filePath);
}

export async function downloadFileFromUrl(fileUrl: string) {
  let pathUrl = "uploads/pdfs";
  // if (process.env.NODE_ENV == "development") {
  //   pathUrl = "uploads/pdfs/";
  // }

  const downloadDirectory = path.join(pathUrl);
  const pdfUrl = fileUrl + ".pdf";
  try {
    // Download the file and get the file path
    const filePath = await downloadFile(pdfUrl, downloadDirectory);
    console.log("File downloaded to:", filePath);
    return filePath;
  } catch (error) {
    console.error("Error occurred:", error);
  }
}
