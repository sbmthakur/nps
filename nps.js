let puppeteer = require('puppeteer');
let nodemailer = require('nodemailer');
let sgTransport = require('nodemailer-sendgrid-transport');
let config = require('./config.json');

let options = {
  auth: config.sendgridAuth
};

let client = nodemailer.createTransport(sgTransport(options));

(async () => {
  try {
    let launchOptions = { 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: 'chromium-browser'
    };
    if(config.executablePath) {
      launchOptions.executablePath = config.executablePath; 
    }
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    let url = 'https://www.moneycontrol.com/nps/nav/hdfc-pension-management-company-limited-scheme-e-tier-i/SM008001';
    await page.goto(url, { timeout: 60000 });

    let sel = '.list1';
    await page.waitFor(sel);

    let text = await page.$eval(sel, e => e.innerText);
    var email = {
      from: config.from,
      to: config.to,
      subject: 'NPS',
      text: text
    };
    client.sendMail(email);
    console.log(new Date, text);
    await browser.close();
  } catch(err) {
    console.log('some err: ', err.message);
  }
})();
