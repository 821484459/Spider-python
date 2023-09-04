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
  const allUrlArr = [
   "http://zhongyibaodian.com/TCM/leinangyan-469-1.html",
   "http://zhongyibaodian.com/TCM/mailizhong-470-1.html",
   "http://zhongyibaodian.com/TCM/qingguangyan-471-1.html",
 "http://zhongyibaodian.com/TCM/ruoshi-472-1.html",
 "http://zhongyibaodian.com/TCM/sanguang-473-1.html",
 "http://zhongyibaodian.com/TCM/shayan-474-1.html",
     "http://zhongyibaodian.com/TCM/shipanshuizhong-475-1.html",
     "http://zhongyibaodian.com/TCM/shishenjingyan-476-1.html",
 "http://zhongyibaodian.com/TCM/shiwangmobingbian-477-1.html",
   "http://zhongyibaodian.com/TCM/xianlizhong-478-1.html",
 "http://zhongyibaodian.com/TCM/xieshi-479-1.html",
     "http://zhongyibaodian.com/TCM/yankuangjibing-480-1.html",
   "http://zhongyibaodian.com/TCM/yanwaishang-481-1.html",
 "http://zhongyibaodian.com/TCM/yuanshi-482-1.html"
  ];
  for (let i = 0; i < allUrlArr.length; i++) {
    console.log("切换到第几个网站了？：", i);
    console.log("网站名为：", allUrlArr[i]);
    try {
      // console.log(i)
      const url = allUrlArr[i];
      await page.waitForTimeout(1000);
      await page.goto(url, { timeout: 60000 });
      const html = await page.content();
      const $ = cheerio.load(html);
      const textTitle = await page.$eval("h1.post-title", (element) =>
        element.innerText.trim()
      );

      // 获取类名为"spider"下的所有a标签
      const spiderLinks = $(".spider a");
      const hrefArr = [];
      // 遍历a标签并获取href值
      spiderLinks.each((index, element) => {
        const href = $(element).attr("href");
        hrefArr.push(href);
      });
      const textPath = `./眼科/${textTitle}.txt`;  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

      for (const href of hrefArr) {
        try {
          console.log("爬到了：", href);
          await page.waitForTimeout(1500);
          // http://zhongyibaodian.com/pianfang-mifang/a${i}.html
          await page.goto("http://zhongyibaodian.com" + href, {
            timeout: 60000,
          });
          const innerContent = await page.content();
          const inner$ = cheerio.load(innerContent);
          const title = await page.$eval("h1.post-title", (element) =>
            element.innerText.trim()
          );
          fs.appendFileSync(textPath, `\nTOPIC::\n${title}\n`, {
            encoding: "utf-8",
          });

          console.log(title);
          const content = inner$(".spider")
            .html() // 获取该元素的html内容（不包含div元素）
            .replace(/<br\s*\/?>/g, "\n") // 将<br>标签替换为换行符
            .replace(/<\/?a[^>]*>/g, "") // 移除a标签及其内容
            .replace(/<\/?strong[^>]*>/g, "") // 移除strong标签及其内容
            .replace(/<\/?p[^>]*>/g, "\n") // 将<p>标签替换为换行符
            .replace(/&nbsp;/g, " "); // 将&nbsp;替换为空格字符
          console.log(content);
          fs.appendFileSync(textPath, content, { encoding: "utf-8" });
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
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
