export const maxDuration = 60;
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit, checkApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { threadId } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const agentId: string = process.env.AGENT_ID || "";

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free Trial is Expired", { status: 403 });
    }

    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: agentId,
    });

    if (run.status === "completed") {
      await increaseApiLimit();

      return NextResponse.json({ summarized: true });
    } else if (run.status === "failed" || run.status === "cancelled") {
      return NextResponse.json({ summarized: false });
    }
  } catch (e) {
    console.log("[CONVERSATION_ERROR]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
