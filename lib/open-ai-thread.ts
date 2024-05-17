"use server";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

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

export async function createThreadAndUpdateDB(filePath: string, data: any) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Upload a file with an "assistants" purpose
  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: `You are a research assistant and an expert content writer with a background of Machine Learning, Deep Learning and LLMs. 
        You will read the research paper file provided and will provide key points in the paper in a way that can be used in a newsletter. 
        Response should be only in a valid raw JSON format and has no template literals or any other character.`,
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

  const t = await prismadb.threads.create({
    data,
  });
  revalidatePath(`/article/${t?.id}`);
  return t?.id;
}

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

  console.log(threadDetails);
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
