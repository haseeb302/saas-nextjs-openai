"use server";
import axios from "axios";
import convert from "xml-js";

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

    // let authors: any = [];
    // Object.values(value?.author).forEach((author: any, index) => {
    //   console.log(author?.name?._text);
    //   if (value?.author?.length > 2 && index === 2) {
    //     authors.push("et al.");
    //     return authors;
    //   }
    //   authors.push(author?.name?._text);
    // });
    // article.authors = authors;

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

export const getArticles = async (searchKeyword: string) => {
  try {
    const searchUrl = `http://export.arxiv.org/api/query?search_query=all:${searchKeyword}&start=0&max_results=10&sortBy=submittedDate`;
    const articles = await axios.get(searchUrl).then(async (response) => {
      let res: any = convert.xml2json(response?.data, {
        compact: true,
        ignoreDeclaration: true,
        trim: true,
      });
      res = JSON.parse(res);
      const entries = res?.feed?.entry;
      console.log(entries);
      if (entries?.length > 0) {
        return parseResponse(entries);
      }
      return [];
    });
    return articles;
  } catch (e) {
    console.log(e);
    return e;
  }
  // console.log(res);
  // let parser = new Parser({
  //   customFields: { item: [["dc:author"], { keepArray: true }] },
  // });
  // const feed = await parser.parseString(response.data);
  // const feed = htmlparser2.parseFeed(response.data, { xmlMode: true });

  // console.log(feed);
  // const searchUrl = `https://arxiv.org/search/?searchtype=all&query=${searchKeyword}&abstracts=show&size=50&order=-announced_date_first`;
  // const articles = await axios
  //   .get(searchUrl)
  //   .then((response) => {
  //     const $ = cheerio.load(response.data);
  //     const articles: any[] = [];
  //     $(".arxiv-result").each((index, element) => {
  //       const title = $(element).find(".title.is-5").text().trim();
  //       const authors = $(element)
  //         .find(".authors")
  //         .text()
  //         .trim()
  //         .replace("Authors:", "")
  //         .split(",")
  //         .map((a) => a.trim());
  //       const pdfLink = $(element)
  //         .find(".list-title span a")
  //         .first()
  //         .attr("href");
  //       const abstract = $(element).find(".abstract.mathjax").text().trim();

  //       articles.push({ title, authors, pdfLink, abstract });
  //     });
  //     return articles;
  //   })
  //   .catch((error) => {
  //     console.error("Error fetching data:", error);
  //   });
};
