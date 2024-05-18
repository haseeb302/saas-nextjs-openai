"use server";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";
import fetch from "node-fetch";

// import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
// import { checkSubscription } from "@/lib/subscription";
// import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

// export async function GET() {
//   const pdf = await pdfjs.getDocument("public/2405.03152.pdf").promise;
//   const page = await pdf.getPage(1);
//   const textContent = await page.getTextContent();

//   return textContent;
// }

// export async function GET() {
//   const loader = new PDFLoader("public/llm-reader.pdf", {
//     splitPages: false,
//   });

//   const docs = await loader.load();

//   return new NextResponse(JSON.stringify(docs), { status: 200 });
// }

export async function getThreadByID(threadId: string) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const thread = await prismadb.threads.findUnique({
    where: {
      id: threadId,
    },
  });

  let openAiThread;

  if (thread) {
    openAiThread = await openai.beta.threads.retrieve(thread?.threadId || "");
  }

  const threadDetails = {
    openAiThread,
    thread,
  };

  return threadDetails;
}

export async function getUserThreads() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userThreads = await prismadb.user.findUnique({
    where: {
      userId: userId,
    },
    include: {
      Threads: true,
    },
  });

  return userThreads?.Threads;
}

export async function getThreadResponse(threadId: string) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const messages: any = await openai.beta.threads.messages.list(threadId);
    if (messages?.data.length < 2) {
      return null;
    }
    let x = messages?.data[0]?.content[0]?.text?.value;
    x.replace(/```json\n?|```/g, "");
    x = x.replace(/\\(?!["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
    try {
      const parsedObject = JSON.parse(x);
      return parsedObject;
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      return null; // or handle the error as needed
    }
  } catch (e) {
    console.log(e);
    return "There was an error while getting data, try again or try another file";
  }
}
