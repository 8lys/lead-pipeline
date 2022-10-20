// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration } from "crawlee";
import { router } from "./routes.js";

const crawler = new PlaywrightCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  requestHandler: router,
  launchContext: {
    launchOptions: {
      headless: false,
      slowMo: 150,
    }
  }
});

await crawler.run([
  {
    url: "http://dnr.alaska.gov/ssd/recoff/search/indexmenu",
    label: "documentTypeSearch"
  },
]);
