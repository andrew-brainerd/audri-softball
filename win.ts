import puppeteer, { Browser, ElementHandle, PuppeteerLaunchOptions } from 'puppeteer';

const pupOptions: PuppeteerLaunchOptions = {
  headless: false,
  defaultViewport: { width: 800, height: 1000 }
};

(async () => {
  const browser = await puppeteer.launch(pupOptions);

  for (let i = 0; i < 5; i++) {
    await doWinningShit(browser, i);
  }

  // await browser.close();
})();

async function getPollLink(browser: Browser) {
  const athleteOfTheWeekUrl =
    'https://www.mlive.com/highschoolsports/2023/06/vote-for-ultimate-flint-area-spring-sports-athlete-of-the-week-for-2023.html?outputType=amp';
  const athleteOfTheWeekPage = await openNewTab(browser, athleteOfTheWeekUrl);
  const [pollLink] = await athleteOfTheWeekPage.$x("//p[contains(., 'not seeing the poll below')]");
  const href = await pollLink.$eval('a', link => link.getAttribute('href'));

  console.log('Poll Link:', href);
}

async function doWinningShit(browser: Browser, index: number) {
  const pollUrl = 'https://poll.fm/12449654';
  const pollPage = await openNewTab(browser, pollUrl);

  const pollOptions = await pollPage.$$('.css-answer-row');

  await Promise.all(
    pollOptions.map(async pollOption => {
      const optionText = await pollOption.evaluate(fi => fi.textContent?.trim());
      const [input] = await pollOption.$$('.css-answer-input input');

      if (optionText?.includes('Audri Hrncharik')) {
        await input.click();
      }
    })
  );

  const [voteButtonContainer] = await pollPage.$$('.css-votebutton-outer');
  const [voteButton] = await voteButtonContainer.$$('a');

  await wait(Math.round(Math.random() * 15));
  await voteButton.click();

  // console.log('Vote Result:', pollPage.);

  await pollPage
    .screenshot({ path: `result-${index}.png`, fullPage: true, fromSurface: true, captureBeyondViewport: true })
    .then(() => {
      index++;
    });
}

async function openNewTab(browser: Browser, url: string) {
  const page = await browser.newPage();
  // await page.setRequestInterception(true);
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

async function getClass(elementHandle: ElementHandle) {
  return await (await elementHandle.getProperty('className')).jsonValue();
}

async function wait(time: number) {
  await new Promise(res => setTimeout(res, time));
}
