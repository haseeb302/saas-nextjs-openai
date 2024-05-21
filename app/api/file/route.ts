import { auth } from "@clerk/nextjs";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import { checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchParam = new URLSearchParams(url.searchParams);
  const fileUrl = searchParam.get("fileUrl");

  let directoryPath =
    process.env.NODE_ENV === "development" ? "uploads/pdfs" : "/tmp/";

  const pdfUrl = fileUrl + ".pdf";
  try {
    // Download the file and get the file path
    const filePath = await downloadFile(pdfUrl, directoryPath);
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filePath, data } = body;
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free Trial is Expired", { status: 403 });
    }

    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: "assistants",
    });

    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `Here is my attached file. Provide a response only in JSON format.`,
          attachments: [
            {
              file_id: file.id,
              tools: [{ type: "file_search" }],
            },
          ],
        },
      ],
    });
    data.userId = userId;
    data.threadId = thread.id;
    data.threadName = "Article";

    const user = await prismadb.user.findUnique({
      where: { userId },
    });

    let dbThread = null;

    if (!user) {
      const user = await prismadb.user.create({
        data: { userId: userId, count: 1 },
      });

      dbThread = await prismadb.threads.create({
        data,
      });
    } else {
      dbThread = await prismadb.threads.create({
        data,
      });
    }

    revalidatePath(`/article/${dbThread?.id}`);
    return new NextResponse(dbThread?.id, { status: 200 });
  } catch (e) {
    console.log(e);
    return new NextResponse(
      "There was an error while creating thread, try again or try another file",
      {
        status: 400,
      }
    );
  }
}
