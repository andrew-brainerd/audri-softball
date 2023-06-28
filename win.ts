import chalk from 'chalk';
import fs from 'fs';
import puppeteer, { ElementHandle, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { Browser } from 'puppeteer';

const pupOptions: PuppeteerLaunchOptions = {
  headless: false,
  defaultViewport: { width: 800, height: 1000 }
};

// if (process.platform === 'win32') {
//   pupOptions.executablePath = 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe';
// }

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
  // const pollOptions = await pollPage.$x("//div[contains(@class, 'css-answer-group')]");

  const pollOptions = await pollPage.$$('.css-answer-row');

  await Promise.all(
    pollOptions.map(async pollOption => {
      const optionText = await pollOption.evaluate(fi => fi.textContent?.trim());
      // const [input] = await pollOption.$$('input');
      const [input] = await pollOption.$$('.css-answer-input input');

      if (optionText?.includes('Audri Hrncharik')) {
        console.log('Best Athlete:', optionText);
        console.log('Input', input);
        

        await input.click();
        await pollOption.click();
      }
    })
  );

  // const [pollLink] = await pollPage.$x("//span[contains(., 'Audri Hrncharik')]");
  // const href = await pollLink.$eval('a', link => link.getAttribute('href'));

  // console.log('Poll Options', pollOptions);

  // if (pollLink) {
  //   const link = pollLink as ElementHandle<Element>;

  //   console.log('Clicking link', link);

  //   // link.$eval("")

  //   link.hover();
  //   link.focus();
  //   link.click(); 
  // } else {
  //   console.log('Clicking nothing, fuck');
  // }

  await wait(5000);
  // console.log("Winner Span:", pollLink);
}

async function openNewTab(browser: Browser, url: string) {
  const page = await browser.newPage();
  await page.goto(url).catch(e => console.error('Navigation Error', e));
  await page.waitForNetworkIdle(); // { timeout: 5000 }
  // await page.waitForNavigation({ waitUntil: 'networkidle0' });

  return page;
}

async function getClass(elementHandle: ElementHandle) {
  return await (await elementHandle.getProperty('className')).jsonValue();
}

async function wait(time: number) {
  await new Promise(res => setTimeout(res, time));
}
