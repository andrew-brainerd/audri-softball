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

async function doWinningShit(browser: Browser) {
  const athleteOfTheWeekUrl = 'https://www.mlive.com/highschoolsports/2023/06/vote-for-ultimate-flint-area-spring-sports-athlete-of-the-week-for-2023.html?outputType=amp';
  const athleteOfTheWeekPage = await openNewTab(browser, athleteOfTheWeekUrl);
  const [pollLink] = await athleteOfTheWeekPage.$x("//p[contains(., 'not seeing the poll below')]");
  const href = await pollLink.$eval('a', link => link.getAttribute('href'));
  // const productsList = await athleteOfTheWeekPage.$$('#mainContent ul[data-test-id="productResults"] li article');

  console.log('Poll Link:', href);

  // await Promise.all(productsList.map(async product => {
  //   const href = await product.$eval('a', link => link.getAttribute('href'));
  //   console.log('Link:', href);
  //   const quickFacts = await getQuickFacts(browser, `${baseUrl}${href}`);

  //   console.log('Quick Facts', quickFacts);
  // }));
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
