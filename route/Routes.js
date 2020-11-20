import { Router } from "express";

import scrape from "../app/scraper";

const router = Router();

router.get("/welcome", (_req, res) => {
    res.json({
        status: "success",
        data: {},
        message:
            "We can talk, If you are looking for disassembling or test my code, I'm afraid it will cost your time because it was very protected and have high security. Need help for your project? we can talk. Just contact me at magicwarms@gmail.com",
    });
});

router.get("/scrape", scrape.startScrape);

export default router;
