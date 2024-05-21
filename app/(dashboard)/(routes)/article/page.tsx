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

import { Empty } from "@/components/Empty";

const formSchema = z.object({
  keyword: z.coerce.string().min(1, "Keyword is required"),
});

export default function ConversationPage() {
  const proModal = useProModal();
  const [articles, setArticles] = useState<any>([]);
  const [selectingArticle, setSelectingArticle] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: "",
    },
  });

  useEffect(() => {
    setArticles(JSON.parse(localStorage.getItem("articles")));
  }, []);

  const isLoading = form.formState.isSubmitting;

  const createThread = async (article: any) => {
    try {
      setSelectingArticle(true);
      const { title, pdfLink, authors } = article;
      const author = authors[0]?.name;

      let filePath: string = "";

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
        const response = await axios.post("/api/file", { filePath, data });
        const threadId = response.data;

        router.push(`/article/${threadId}`);
      }
    } catch (e) {
      console.log(e);
      setSelectingArticle(false);
      if (e?.response?.status === 403) {
        proModal.onOpen();
      }
    } finally {
      setSelectingArticle(false);
      router.refresh();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const recentArticles = await getArticles(values.keyword);

      if (recentArticles?.length > 0) {
        localStorage.removeItem("articles");
        localStorage.setItem("articles", JSON.stringify(recentArticles));
      } else {
        setError(true);
      }
      setArticles(recentArticles);
    } catch (e: any) {
      console.log(e);
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="mt-16 px-12">
      <Heading
        title="Researcher"
        description="Advanced AI tool to read latest research papers as a newsletter"
        icon={GraduationCap}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-8 leading-8">
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
        {selectingArticle && (
          <>
            <p>Please wait it may take sometime.</p>
            <Loader2 className="mx-2 h-8 w-8 animate-spin" />
          </>
        )}
        {error && (
          <p className="text-red-500 font-bold">Please try again later.</p>
        )}
        {articles?.length > 0 ? (
          articles?.map((article: any, index: number) => (
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
            <Empty label="No articles found yet." />
          </div>
        )}
      </div>
    </div>
  );
}
