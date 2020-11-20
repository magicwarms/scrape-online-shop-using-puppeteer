import puppeteer from "puppeteer";

const startBrowser = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--start-maximized"],
        ignoreHTTPSErrors: true,
        defaultViewport: {
            width: 1366,
            height: 768,
        },
    });
    return await browser.newPage();
};

export default {
    startScrape: async (_req, res, next) => {
        const page = await startBrowser();
        try {
            // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
            await page.goto("http://books.toscrape.com");
            // Wait for the required DOM to be rendered
            await page.waitForSelector(".page_inner");
            // For screenshot page
            // await page.screenshot({ path: "screenshot.png" });
            // Get the link to all the required categories
            // let urls = await page.$$eval("div.side_categories > ul > li > ul > li", (links) => {
            //     const getData = links.map((el) => {
            //         return {
            //             title: el
            //                 .querySelector("a")
            //                 .innerText.trim()
            //                 .replace(/(\r\n|\n|\r)/gm, " "),
            //             link: el.querySelector("a").href,
            //         };
            //     });
            //     return getData;
            // });
            // for (let i = 0; i < urls.length; i++) {
            //     const item = urls[i];
            //     console.info(`VISITED ${item.title} STARTED`);
            //     await page.goto(item.link);
            //     await page.waitForSelector(".page_inner");
            //     await page.waitForTimeout(3000);
            //     await page.goBack();
            //     console.info(`VISITED ${item.title} DONE`);
            // }

            let urls = await page.$$eval("section ol > li", (links) => {
                const getData = links.map((el) => {
                    return {
                        title: el
                            .querySelector("h3 > a")
                            .innerHTML.trim()
                            .replace(/(\r\n|\n|\r)/gm, " "),
                        link: el.querySelector("h3 > a").href,
                    };
                });
                return getData;
            });
            for (let i = 0; i < urls.length; i++) {
                const item = urls[i];
                console.info(`VISITED ${item.title} STARTED`);
                await page.goto(item.link);
                await page.waitForSelector(".page_inner");
                console.info(`VISITED ${item.title} DONE`);
            }
            await page.goto("http://books.toscrape.com");
            await page.waitForSelector(".page_inner");
            await page.waitForTimeout(2000);
            const checkNextLinkExisted = await page.evaluate(() => {
                const isExist = document.querySelector("li.next > a").href;
                return isExist ? isExist : false;
            });
            if (checkNextLinkExisted) {
                await page.goto(checkNextLinkExisted);
                console.info(`GO TO PAGE 2`);
                await page.waitForSelector(".page_inner");
                let urls = await page.$$eval("section ol > li", (links) => {
                    const getData = links.map((el) => {
                        return {
                            title: el
                                .querySelector("h3 > a")
                                .innerHTML.trim()
                                .replace(/(\r\n|\n|\r)/gm, " "),
                            link: el.querySelector("h3 > a").href,
                        };
                    });
                    return getData;
                });
                for (let i = 0; i < urls.length; i++) {
                    const item = urls[i];
                    console.info(`VISITED ${item.title} STARTED`);
                    await page.goto(item.link);
                    await page.waitForSelector(".page_inner");
                    console.info(`VISITED ${item.title} DONE`);
                }
            }
            await page.close();

            return res.status(200).json({
                success: true,
                data: {},
                message: "Scrapping success",
            });
        } catch (err) {
            await page.close();
            next(err);
        }
    },
};
