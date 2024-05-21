"use server";
import search from "arxiv-api-ts";

function parseResponse(data: any) {
  let articles: any = [];
  Object.values(data).forEach((value: any) => {
    const article = {
      title: value?.title?._text,
      abstract: value?.summary?._text,
      published: value?.published?._text,
      pdfLink: "",
      authors: value?.author[0]?.name?._text,
    };
    Object.values(value?.link).forEach((link: any, index) => {
      if (
        link?._attributes.title === "pdf" ||
        link?._attributes.type === "application/pdf"
      ) {
        article.pdfLink = link?._attributes.href;
        return;
      }
    });

    articles.push(article);
  });
  return articles;
}

function parseLinks(papers: any) {
  return papers.map((paper: any) => {
    paper.pdfLink = paper?.id?.replace(
      "http://arxiv.org/abs/",
      "https://arxiv.org/pdf/"
    );
    return paper;
  });
}

export const getArticles = async (searchKeyword: string) => {
  try {
    const papers = await search({
      searchQueryParams: [
        {
          include: [{ name: searchKeyword }],
        },
      ],
      start: 0,
      maxResults: 10,
      sortBy: "submittedDate",
    });
    console.log(papers.entries);
    const papersWithLinks = parseLinks(papers?.entries);

    return papersWithLinks;
  } catch (e) {
    console.log(e);
    return e;
  }
};
