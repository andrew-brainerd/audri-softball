import puppeteer, { Browser, PuppeteerLaunchOptions } from 'puppeteer';
import querystring from 'querystring';

const pupOptions: PuppeteerLaunchOptions = {
  headless: false,
  defaultViewport: { width: 800, height: 1000 }
};

const iterations = parseInt(process.env.NUM_ITERATIONS || '', 10) || 25;

let voteCount = 0;
let revoteCount = 0;

(async () => {
  const browser = await puppeteer.launch(pupOptions);

  console.time('Run Time');

  for (let i = 0; i < iterations; i++) {
    if (i !== 0) {
      await wait(parseInt(process.env.ITER_WAIT || '', 10) || 5000);
    }
    await pickTheWinner(browser, i);
  }

  const successRate = voteCount > 0 ? Math.round(voteCount / iterations * 100) : 0;

  console.log('Vote Results', { voteCount, revoteCount, successRate });

  console.timeEnd('Run Time');

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
        await wait(Math.round(Math.random() * 60 + 15));
        await pollPage.mouse.move(Math.round(Math.random() * 60 + 250), Math.round(Math.random() * 60 + 250));
        await input.click();
      }
    })
  );

  const [voteButtonContainer] = await pollPage.$$('.css-votebutton-outer');
  const [voteButton] = await voteButtonContainer.$$('a');

  await wait(Math.round(Math.random() * 60 + 15));
  await pollPage.mouse.move(Math.round(Math.random() * 60 + 250), Math.round(Math.random() * 60 + 250));
  await voteButton.click();

  const pages = await browser.pages();
  const url = await pages[index].evaluate(() => window.location.href);
  const query = url.split('?')[1];
  const message = querystring.parse(query).msg;

  if (message === 'voted') {
    voteCount++;
    console.log('Vote Counted 🎉');
  } else if (message === 'revoted') {
    revoteCount++;
  }
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
