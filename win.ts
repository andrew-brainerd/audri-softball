import puppeteer, { Browser, PuppeteerLaunchOptions } from 'puppeteer';
import querystring from 'querystring';

const pupOptions: PuppeteerLaunchOptions = {
  headless: false,
  defaultViewport: { width: 800, height: 1000 }
};

let voteCount = 0;
let revoteCount = 0;

(async () => {
  const browser = await puppeteer.launch(pupOptions);

  for (let i = 0; i < 15; i++) {
    await wait(10000);
    await pickTheWinner(browser, i);
  }

  console.log('Vote Results', { voteCount, revoteCount });

  await browser.close();
})();

async function pickTheWinner(browser: Browser, index: number) {
  const pollUrl = 'https://poll.fm/12449654';
  const pollPage = await openNewTab(browser, pollUrl);

  const pollOptions = await pollPage.$$('.css-answer-row');

  await Promise.all(
    pollOptions.map(async pollOption => {
      const optionText = await pollOption.evaluate(fi => fi.textContent?.trim());
      const [input] = await pollOption.$$('.css-answer-input input');

      if (optionText?.includes('Audri Hrncharik')) {
        await wait(Math.round(Math.random() * 15));
        await input.click();
      }
    })
  );

  const [voteButtonContainer] = await pollPage.$$('.css-votebutton-outer');
  const [voteButton] = await voteButtonContainer.$$('a');

  await wait(Math.round(Math.random() * 90 + 10));
  await voteButton.click();

  const pages = await browser.pages();
  const url = await pages[index].evaluate(() => window.location.href);
  const query = url.split('?')[1];
  const message = querystring.parse(query).msg;

  if (message === 'voted') {
    voteCount++;
  } else if (message === 'revoted') {
    revoteCount++;
  } else {
    console.warn('Unknown message received', message);
  }

  await pollPage.screenshot({
    path: `result-${index}.png`,
    fullPage: true,
    fromSurface: true,
    captureBeyondViewport: true
  });
}

async function openNewTab(browser: Browser, url: string) {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'upgrade-insecure-requests': '1',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,en;q=0.8'
  });
  await page.goto(url).catch(e => console.error('Navigation Error', e));
  await page.waitForNetworkIdle();

  return page;
}

async function wait(time: number) {
  await new Promise(res => setTimeout(res, time));
}
