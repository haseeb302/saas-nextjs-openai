"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Roboto } from "next/font/google";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { getThreadByID, getThreadResponse } from "@/lib/open-ai-thread";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProModal } from "@/hooks/use-pro-modal";

const roboto = Roboto({
  weight: ["700"],
  style: ["italic"],
  subsets: ["latin"],
});

export default function Page() {
  const [threadDetails, setThreadDetails] = useState<any>(null);
  const [openAiThread, setOpenAiThread] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [hasSummary, setHasSummary] = useState<any>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>("");
  const proModal = useProModal();
  const router = useRouter();

  const params = useParams<{ id: string }>();

  useEffect(() => {
    async function getThread() {
      setLoading(true);
      const id = params.id;
      const t: any = await getThreadByID(id);
      setThreadDetails(t?.thread);
      setOpenAiThread(t?.openAiThread);

      const res: any = await getThreadResponse(t?.openAiThread?.id);
      if (res) {
        setHasSummary(true);
        setResponse(res);
      }
      setLoading(false);
    }
    getThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summarize = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/pdfSummariser", {
        threadId: openAiThread?.id,
      });
      if (response?.data) {
        const res: any = await getThreadResponse(openAiThread?.id);
        if (res) {
          setHasSummary(true);
          setResponse(res);
        }
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      if (error?.response?.status === 403) {
        proModal.onOpen();
      }
      setError(e);
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="px-8">
      {threadDetails !== null && (
        <Card className="my-3">
          <CardHeader>
            <CardTitle className={cn("text-4xl", roboto.className)}>
              {threadDetails?.articleTitle}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-bold">
              {threadDetails?.articleAuthor
                ? `Author: ${threadDetails?.articleAuthor}, et
              al.`
                : "Author not found"}
            </CardDescription>
            {/* <CardDescription>{threadDetails?.abstract}</CardDescription> */}
            {/* <CardDescription className="text-xs">
              Submitted on {formatRelative(subDays(new Date(), 3), new Date())}
            </CardDescription> */}
          </CardHeader>
          <CardFooter>
            <Button
              variant="premium"
              onClick={() => summarize()}
              disabled={hasSummary || loading}
            >
              {hasSummary ? "Regenerate Summary" : "Summarize"}
            </Button>
            {error && <p className="text-red-500 font-semibold">{error}</p>}
            {/* <Button variant={"premium"}>Generate Summary</Button> */}
          </CardFooter>
        </Card>
      )}
      {loading && <Loader2 className="mx-2 h-8 w-8 animate-spin" />}
      {response && (
        <div>
          <div className="p-4 bg-gray-100">
            <div className="max-w-3xl text-center mx-auto">
              {/* <h2 className="text-2xl font-bold mb-4">{response?.["Title"]}</h2> */}
              {/* <p>
                <span className="font-bold">Author: </span>
                {response?.["Authors"]?.map((author: any) => author + ", ")}
              </p> */}
              <div className="mb-5">
                <h2 className={cn("font-bold text-2xl", roboto.className)}>
                  One Line Abstract{" "}
                </h2>
                <br />
                <p>{response?.one_line_abstract}</p>
              </div>
              <div className="mb-5">
                <h2 className={cn("font-bold text-2xl", roboto.className)}>
                  Introduction{" "}
                </h2>
                <br />
                <p>{response?.introduction}</p>
              </div>
              <div className="mb-5">
                <h2 className={cn("font-bold text-2xl", roboto.className)}>
                  Summary{" "}
                </h2>
                <br />
                <p>{response?.summary}</p>
              </div>
              <div className="mb-5">
                <h2 className={cn("text-2xl font-bold", roboto.className)}>
                  Key Points
                </h2>
                <br />
                <ul className="list-disc list-inside leading-relaxed">
                  {response?.key_points?.map((keys: any) => (
                    <li key={keys}>{keys}</li>
                  ))}
                </ul>
              </div>
              <h3 className="text-xl font-bold">Achievement</h3>
              <br />
              <p>{response?.achievements}</p>
              <div className="mb-5">
                <h2 className={cn("text-2xl font-bold mt-4", roboto.className)}>
                  Conclusion
                </h2>
                <br />
                <p>{response?.conclusion}</p>
              </div>
              <div className="mb-5">
                <h2 className={cn("text-2xl font-bold mt-4", roboto.className)}>
                  References:
                </h2>
                <br />
                <ul className="list-disc list-inside leading-relaxed">
                  {response?.useful_references?.map(
                    (keys: any, index: number) => (
                      <li key={index}>{keys}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
