import puppeteer, { Browser, ElementHandle, PuppeteerLaunchOptions } from 'puppeteer';

const pupOptions: PuppeteerLaunchOptions = {
  headless: false,
  defaultViewport: { width: 800, height: 1000 }
};

(async () => {
  const browser = await puppeteer.launch(pupOptions);

  await doWinningShit(browser);

  await browser.close();
})();

async function getPollLink(browser: Browser) {
  const athleteOfTheWeekUrl =
    'https://www.mlive.com/highschoolsports/2023/06/vote-for-ultimate-flint-area-spring-sports-athlete-of-the-week-for-2023.html?outputType=amp';
  const athleteOfTheWeekPage = await openNewTab(browser, athleteOfTheWeekUrl);
  const [pollLink] = await athleteOfTheWeekPage.$x("//p[contains(., 'not seeing the poll below')]");
  const href = await pollLink.$eval('a', link => link.getAttribute('href'));

  console.log('Poll Link:', href);
}

async function doWinningShit(browser: Browser) {
  const pollUrl = 'https://poll.fm/12449654';
  const pollPage = await openNewTab(browser, pollUrl);

  const pollOptions = await pollPage.$$('.css-answer-row');

  await Promise.all(
    pollOptions.map(async pollOption => {
      const optionText = await pollOption.evaluate(fi => fi.textContent?.trim());
      const [input] = await pollOption.$$('.css-answer-input input');

      if (optionText?.includes('Audri Hrncharik')) {
        console.log('Best Athlete:', optionText);
        

        await input.click();
      }
    })
  );

  const [voteButtonContainer] = await pollPage.$$('.css-votebutton-outer');
  const [voteButton] = await voteButtonContainer.$$('a');

  await wait(15000);
  await voteButton.click();

  await pollPage.screenshot({ path: 'result.png', fullPage: true, fromSurface: true });

  await wait(5000);
}

async function openNewTab(browser: Browser, url: string) {
  const page = await browser.newPage();
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
