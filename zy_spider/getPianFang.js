// 获取文章详情
// http://www.tcmdoc.cn/article/108980.thtml

import puppeteer from "puppeteer";
import cheerio from "cheerio";
// import fetch from "node-fetch";
import fs from "fs";
// import fssync from "fs/promises";
// import path from "path";
// import readline from "readline";

(async () => {
  //   打开浏览器窗口
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  for (let i = 28014; i <= 28063; i++) {
    try {
        console.log(i)
        const url = `http://zhongyibaodian.com/changshi/b${i}.html`;
        await page.waitForTimeout(800);
        await page.goto(url,{timeout: 60000});
        const html = await page.content();
        const $ = cheerio.load(html);
        const textPath = "./用药常识/其它.txt";
        //   console.log(html)
        const title = await page.$eval("h1.post-title", (element) =>
          element.innerText.trim()
        );
        // 在文本文件开头添加标题
        fs.appendFileSync(textPath, `\nTOPIC::\n${title}\n`, { encoding: "utf-8" });
        console.log(title);
    
        const content = $(".spider")
          .html() // 获取该元素的html内容（不包含div元素）
          .replace(/<br\s*\/?>/g, "\n") // 将<br>标签替换为换行符
          .replace(/<\/?a[^>]*>/g, "") // 移除a标签及其内容
          .replace(/<\/?strong[^>]*>/g, "") // 移除strong标签及其内容
          .replace(/<\/?p[^>]*>/g, "\n") // 将<p>标签替换为换行符
          .replace(/&nbsp;/g, " "); // 将&nbsp;替换为空格字符
    
        console.log(content);
        fs.appendFileSync(textPath, content, { encoding: "utf-8" });
    } catch (error) {
        console.log(error)
    }

  }

  // 延迟 30 秒
  //   console.log("等待 30 秒...");
  //   await page.waitForTimeout(20000);

  //   for (let i = 0; i < res.length; i++) {
  //     console.log(res[i]);
  //     // const url2 = `http://www.tcmdoc.cn/article/108980.thtml`;

  //     await page.goto(res[i]);
  //     //   await page.waitForTimeout(10000);

  //     // 访问网页并获取 HTML 内容
  //     const html = await page.content();
  //     const $ = cheerio.load(html);
  //     const textPath = "./articles.txt";

  //     // 爬取标题
  //     const title = await page.$eval("span.content-title18-bold", (element) =>
  //       element.innerText.trim()
  //     );

  //     // 在文本文件开头添加标题
  //     fs.appendFileSync(textPath, `\nTOPIC::\n${title}\n`, { encoding: "utf-8" });

  //     const content = $("#PanelContent")
  //       .html() // 获取该元素的html内容（不包含div元素）
  //       .replace(/<br\s*\/?>/g, "\n") // 将<br>标签替换为换行符
  //       .replace(/<\/?a[^>]*>/g, "") // 移除a标签及其内容
  //       .replace(/<\/?strong[^>]*>/g, "") // 移除strong标签及其内容
  //       .replace(/<\/?p[^>]*>/g, "\n") // 将<p>标签替换为换行符
  //       .replace(/&nbsp;/g, " "); // 将&nbsp;替换为空格字符

  //     console.log(content);
  //     fs.appendFileSync(textPath, content, { encoding: "utf-8" });
  //   }

  // 关闭浏览器窗口
  await browser.close();
})();
