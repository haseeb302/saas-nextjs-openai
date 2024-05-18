"use client";

import Heading from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProModal } from "@/hooks/use-pro-modal";

import { formatRelative, subDays } from "date-fns";

import { getArticles } from "@/lib/scrape-data";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  deleteFileFromLocal,
  downloadFileFromUrl,
} from "@/lib/file-manipulation";
import { createThreadAndUpdateDB } from "@/lib/open-ai-thread";

const formSchema = z.object({
  keyword: z.coerce.string().min(1, "Keyword is required"),
});

export default function ConversationPage() {
  const proModal = useProModal();
  const [articles, setArticles] = useState<any>([]);
  const [selectingArticle, setSelectingArticle] = useState<boolean>(false);

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: "",
    },
  });

  // useEffect(() => {
  //   let interval = undefined;
  //   if (articles?.length <= 0) {
  //     interval = setInterval(async () => {
  //       const recentArticles = await getArticles("tts");
  //       console.log(recentArticles);
  //       setArticles(recentArticles);
  //     }, 5000);
  //   }
  //   return () => clearInterval(interval);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const isLoading = form.formState.isSubmitting;

  const createThread = async (article: any) => {
    setSelectingArticle(true);
    const { title, pdfLink, authors } = article;
    const author = authors[0]?.name;

    let filePath: string | undefined = "";

    if (pdfLink) {
      const response = await axios.get("/api/file", {
        params: { fileUrl: pdfLink },
      });
      filePath = response.data;
      // filePath = await downloadFileFromUrl(pdfLink);
    }

    const data = {
      articleLink: pdfLink,
      articleTitle: title,
      articleAuthor: author || "",
    };

    if (filePath) {
      const threadId = await createThreadAndUpdateDB(filePath, data);
      await deleteFileFromLocal(filePath);
      router.push(`/article/${threadId}`);
    }

    // takes to new page with that article and there is a button where you generate summary and also ask questions
  };

  // const getSummary = async () => {
  //   const response = await axios.get("/api/pdfSummariser");
  //   // console.log(response.data[0].pageContent);
  //   console.log(response?.data?.text.value);
  //   const parser = new DOMParser();
  //   const html = parser.parseFromString(
  //     response?.data?.text.value,
  //     "text/html"
  //   );
  //   console.log();
  //   const x = document.getElementById("article");
  //   x?.append(html.body?.firstElementChild || "");
  //   // setMessages(html.body.firstElementChild?.innerHTML);
  // };

  // const getPapers = async () => {};

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const recentArticles = await getArticles(values.keyword);
      console.log(recentArticles);
      setArticles(recentArticles);
    } catch (error: any) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Researcher"
        description="Advanced AI tool to read latest research papers as a newsletter"
        icon={GraduationCap}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8 leading-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="keyword"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Enter your keyword to get papers from arxiv"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              className="col-span-12 lg:col-span-2 w-full"
              disabled={isLoading}
            >
              Search
            </Button>
          </form>
        </Form>
        {/* <div className="flex gap-x-2">
          <Input placeholder="Enter your keyword to find papers from Arxiv.org" />
          <Button onClick={() => getPapers()}>Search</Button>
        </div> */}
        {/* <p className="text-xs text-muted-foreground mt-2 text-red-400">
          Note you can only search twice a day.
        </p> */}
        {selectingArticle && <Loader2 className="mx-2 h-8 w-8 animate-spin" />}
        {articles?.length > 0 ? (
          articles.map((article: any, index: number) => (
            // <Link >
            <Card className="my-3" key={index}>
              <CardHeader>
                <CardTitle>{article?.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-bold">
                  Author: {article?.authors[0]?.name}, et al.
                </CardDescription>
                <CardDescription>{article?.summary}</CardDescription>
                <CardDescription className="text-xs">
                  Submitted on{" "}
                  {formatRelative(
                    subDays(new Date(article?.published), 3),
                    new Date()
                  )}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => createThread(article)}
                  disabled={selectingArticle}
                >
                  Select this article
                </Button>

                {/* <Button variant={"premium"}>Generate Summary</Button> */}
              </CardFooter>
            </Card>
            // </Link>
          ))
        ) : (
          <div className="flex items-center justify-center mt-20">
            <h1 className="text-3x font-bold text-red-500">
              No articles found, enter another keyword
            </h1>
          </div>
        )}

        {/* <Link href="/article">
          <Card className="my-3">
            <CardHeader>
              <CardTitle>
                On the source of the Fe K-alpha emission in T Tauri Stars.
                Radiation induced by relativistic electrons during flares. An
                application to RY Tau
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-bold">
                <span className="text-black font-extrabold">Authors:</span> [Ana
                I. Gomez de Castro, Anna Antonicci, Juan Carlos Vallejo]
              </CardDescription>
              <CardDescription>
                <span className="text-black font-extrabold">Abstract:</span> T
                Tauri Stars (TTSs) are magnetically active stars that accrete
                matter from the inner border of the surrounding accretion disc;
                plasma gets trapped into the large scale magnetic structures and
                falls onto the star, heating the surface through the so-called
                accretion shocks. The X-ray spectra of the TTSs show prominent
                Fe II Kalpha fluorescence emission at 6.4keV that cannot be
                explained in a pure accretion scenario. Neither, it can be
                produced by the hot coronal plasma. TTSs display all signs of
                magnetic activity and magnetic reconnection events are expected
                to occur frequently. In these events, electrons may get
                accelerated to relativistic speeds and their interaction with
                the environmental matter may result in Fe Kalpha emission. It is
                the aim of this work to evaluate the expected Fe Kalpha emission
                in the context of the TTS research and compare it with the
                actual Fe Kalpha measurements obtained during the flare detected
                while monitoring RY Tau with the XMM-Newton satellite. The
                propagation of high-energy electrons in dense gas generates a
                cascade of secondary particles that results in an electron
                shower of random nature whose evolution and radiative throughput
                is simulated in this work using the Monte Carlo code PENELOPE. A
                set of conditions representing the environment of the TTSs where
                these showers may impinge has been taken into account to
                generate a grid of models that can aid to the interpretation of
                the data. The simulations show that the electron beams produce a
                hot spot at the point of impact; strong Fe Kalpha emission and
                X-ray continuum radiation are produced by the spot. This
                emission is compatible with RY Tau observations. The Fe Kalpha
                emission observed in TTSs could be produced by beams of
                relativistic electrons accelerated in magnetic reconnection
                events during flares
              </CardDescription>
              <CardDescription className="text-xs">
                Submitted on 07 May, 2024
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => createThread()}>
                Select this article
              </Button>
            </CardFooter>
          </Card>
        </Link> */}
        {/* <Button onClick={() => getData()}>Test</Button> */}

        {/* <div id="article">{messages}</div> */}

        {/* <>
          <div className="p-4 bg-gray-100">
            <h1 className="text-2xl font-bold text-center mb-4">
              Newsletter Summary: MMGER for Joint Accent and Speech Recognition
            </h1>

            <div className="mb-6">
              <p className="text-lg font-bold">Title:</p>
              <p>
                MMGER: Multi-modal and Multi-granularity Generative Error
                Correction with LLM for Joint Accent and Speech Recognition
              </p>
            </div>

            <div className="mb-6">
              <p className="text-lg font-bold">Authors:</p>
              <p>
                Bingshen Mu, Yangze Li, Qijie Shao, Kun Wei, Xucheng Wan, Naijun
                Zheng, Huan Zhou, Lei Xie
              </p>
            </div>

            <div className="mb-6">
              <p className="text-lg font-bold">Useful References:</p>
              <ul>
                <li>
                  Bingshen Mu, Yangze Li, Qijie Shao, Kun Wei, Lei Xie. (2015).
                  Multi-modal and Multi-granularity Correction[0]
                </li>
                <li>
                  Bingshen Mu, et al. (2015). Multi-task ASR-AR learning[1]
                </li>
                <li>
                  Xucheng Wan, Naijun Zheng, Huan Zhou. (2015). Case study of
                  MMGER[2]
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <p className="text-lg font-bold">Key Points:</p>
              <ol>
                <li>
                  Introduction to GER and its challenges in ASR error correction
                </li>
                <li>
                  Proposal of MMGER model for multi-accent scenarios using
                  multi-modal and multi-granularity correction
                </li>
                <li>
                  Significant improvements demonstrated in AR accuracy and ASR
                  character error rate
                </li>
              </ol>
            </div>

            <div className="mb-6">
              <p className="text-lg font-bold">Achievement:</p>
              <p>
                MMGER achieved a 26.72% relative improvement in AR accuracy and
                a 27.55% relative reduction in ASR character error rate,
                outperforming other models in the KeSpeech dataset[3].
              </p>
            </div>

            <div className="mb-6">
              <p className="text-lg font-bold">Conclusion:</p>
              <p>
                The MMGER model effectively addressed the limitations of GER and
                tailored LLM-based ASR error correction for multi-accent
                scenarios, showcasing substantial improvements in accuracy and
                error rates[4].
              </p>
            </div>
          </div>
        </> */}
        {/* <div>
          <h1 className="text-3xl font-bold">MMGER Newsletter Edition</h1>
          <hr className="my-5" />
          <h3 className="text-xl font-bold my-3">
            {`Spotlight on Innovation: MMGER's Breakthrough in Speech Recognition`}
          </h3>
          <h4 className="text-md font-bold text-muted-foreground">
            {`A Deep Dive into "MMGER: Multi-modal and Multi-granularity Generative
          Error Correction with LLM for Joint Accent and Speech Recognition"`}
          </h4>

          <p>
            <strong>Authors:</strong> Bingshen Mu, Yangze Li, Qijie Shao, Kun
            Wei, Xucheng Wan, Naijun Zheng, Huan Zhou, Lei Xie.
          </p>

          <p>
            In a pioneering study led by Bingshen Mu et al., a novel approach to
            Automatic Speech Recognition (ASR) has emerged, showcasing
            remarkable advancements in tackling accented speech recognition
            challenges. The groundbreaking work introduces the Multi-modal and
            Multi-granularity Generative Error Correction (MMGER) model,
            leveraging the impressive capabilities of large language models
            (LLMs) for enhanced speech recognition.
          </p>

          <h4 className="text-md font-bold">Key Discoveries & Achievements</h4>
          <ul>
            <li>
              The MMGER model significantly improves AR accuracy by 26.72% and
              reduces the ASR Character Error Rate (CER) by 27.55% relative to a
              well-established baseline, setting a new state-of-the-art CER on
              the multi-accent Mandarin KeSpeech dataset.
            </li>

            <li>
              MMGER uniquely integrates multi-modal correction and
              multi-granularity correction, showcasing fine-grained and
              coarse-grained error correction strategies that adeptly manage the
              nuanced complexities of accented speech.
            </li>

            <li>
              Through a comprehensive experimental evaluation, the MMGER
              outperforms existing models, achieving an impressive AR ACC of
              90.12% on the KeSpeech dataset, demonstrating its robustness
              against accented speech nuances.
            </li>
          </ul>

          <h4 className="text-md">A Leap Forward with MMGER</h4>

          <p>
            {`MMGER's design is inspired by recent challenges in recognizing
          accented speech, where deviations from standard pronunciations impair
          ASR systems' effectiveness. By adopting a multi-task ASR-AR (Accent
          Recognition) learning framework, MMGER seamlessly incorporates both
          acoustic and linguistic information, enabling more adaptable and
          accurate recognition of speech irrespective of accent variability.`}
          </p>

          <p>
            The efficacy of MMGER extends beyond existing generative error
            correction models, employing dynamic hypotheses and accent
            embeddings for a more nuanced understanding of speech. This
            innovative approach allows for a comprehensive correction mechanism,
            fine-tuning speech recognition to accommodate a broad spectrum of
            speech variations and accents .
          </p>

          <h4 className="text-m font-bold">In Conclusion</h4>

          <p>
            The MMGER model embodies a significant leap in speech recognition
            technology, enabling more inclusive and versatile ASR applications.
            As we continue to embrace diverse linguistic nuances globally, MMGER
            paves the way for more accurate, efficient, and adaptable speech
            recognition systems, marking a commendable advancement in bridging
            communication gaps across different languages and accents.
          </p>

          <p>
            Stay tuned for further updates on groundbreaking research and
            innovations in the realm of speech recognition and AI!
          </p>

          <h4 className="text-md">References</h4>

          <ul>
            <li>Deep learning advancements in ASR.</li>
            <li>KeSpeech dataset for multi-accent Mandarin.</li>
            <li>
              Multi-task ASR-AR learning framework's impact on ASR performance .
            </li>
          </ul>

          <p>
            For more details on MMGER and related research, refer to the above
            comprehensive study.{" "}
          </p>

          <p>© MMGER Newsletter 2023</p>
        </div> */}
        {/* <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="I need your prompt.."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div> */}
        {/* <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader className="w-10 h-10 relative animate-spin" />
            </div>
          )}
          {messages?.length === 0 && !isLoading && (
            <Empty label="No conversation started yet." />
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message: any, index: any) => (
              <div
                key={index}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user"
                    ? "bg-white border border-black/10"
                    : "bg-muted "
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}
