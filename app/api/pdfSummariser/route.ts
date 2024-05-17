import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

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

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { threadId } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const agentId: string = process.env.AGENT_ID || "";
    //

    // const assistant = await openai.beta.assistants.create({
    //   name: "Research Assistant",
    //   instructions:
    //     "You are a research assistant and an expert content writer with a background of Machine Learning, Deep Learning and LLMs. I want you to provide the response in HTML format with tailwindcss classes so it looks beautiful.",
    //   model: "gpt-3.5-turbo",
    //   tools: [{ type: "code_interpreter" }],
    // });

    // let vectorStore = await openai.beta.vectorStores.create({
    //   name: "Researcher",
    // });

    // await openai.beta.assistants.update(assistant.id, {
    //   tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    // });

    // const arxivPdf = await openai.files.create({
    //   file: fs.createReadStream("public/llm-reader.pdf"),
    //   purpose: "assistants",
    // });

    // const thread = await openai.beta.threads.create({
    //   messages: [
    //     {
    //       role: "user",
    //       content: `You are a research assistant and an expert content writer with a background of Machine Learning,
    //         Deep Learning and LLMs. You have to provide a summarised version of the paper in a
    //         beautiful newsletter format. Use the title, author name, useful references, key points, achievement, and conclusion.
    //         I want you to provide the response with classes from tailwindcss and no custom classes and use className attribute.
    //         Make the response look beautiful also wrap the whole response in a div. Don't write any other message outside the div.`,
    //       // Attach the new file to the message.
    //       attachments: [
    //         { file_id: arxivPdf.id, tools: [{ type: "file_search" }] },
    //       ],
    //     },
    //   ],
    // });

    // const messages = await openai.beta.threads.messages.list(threadId);
    // if (messages?.data.length < 2) {
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: agentId,
    });

    if (run.status === "completed") {
      return NextResponse.json({ summarized: true });
    } else if (run.status === "failed" || run.status === "cancelled") {
      return NextResponse.json({ summarized: false });
    }
    // }

    // if (messages?.data[0]?.content[0].text?.value?.includes("```json")) {
    //   const x = messages?.data[0]?.content[0].text?.value.replace(
    //     /```json\n?|```/g,
    //     ""
    //   );
    //   message = JSON.parse(x);
    //   console.log(x);
    // } else {
    //   message = messages?.data[0]?.content[0].text?.value;
    //   message = JSON.parse(message);
    // }
    // console.log(message);
    // if (!isPro) {
    //   await increaseApiLimit();
    // }

    // return NextResponse.json(message);
  } catch (e) {
    console.log("[CONVERSATION_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// function getResponse(threadId: string) {
//   const messages = openai.beta.threads.messages.list(threadId);
//   if (message?.content[0]?.type === "text") {
//     const { text } = message?.content[0];
//     const { annotations } = text;

//     let index = 0;
//     for (let annotation of annotations) {
//       text.value = text.value.replace(annotation.text, "[" + index + "]");
//       index++;
//     }
//   }
// }
