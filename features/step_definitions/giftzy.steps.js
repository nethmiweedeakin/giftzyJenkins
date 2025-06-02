const { Given, When, Then, AfterAll } = require('@cucumber/cucumber');
const { Builder, By, Capabilities, Key, until } = require('selenium-webdriver');
require("chromedriver");
const chrome = require('selenium-webdriver/chrome');

// Chrome options for headless mode
const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--headless=new');
chromeOptions.addArguments('--disable-gpu');
chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--window-size=1920,1080');
chromeOptions.addArguments('--disable-dev-shm-usage');

// WebDriver setup
const driver = new Builder()
  .forBrowser('chrome')
  .setChromeOptions(chromeOptions)
  .build();

Given('I am logged into Giftzy',  {timeout : 30 * 1000}, async function () {
      console.log('this:', this);


  try {
    console.log('Navigating to login page...');
    await driver.get('http://localhost:3000/login'); // Load page

    // Wait until email input is visible to ensure page is loaded
    await driver.wait(until.elementLocated(By.name('email')), 10000);

    // Now fill in and submit login form
    await driver.findElement(By.name('email')).sendKeys('weeramann@gmail.com');
    await driver.findElement(By.name('password')).sendKeys('pass', Key.RETURN);

    // Wait until you see the Gift Marketplace link after login
  
    await driver.wait(until.elementLocated(By.linkText('Gift Marketplace')), 10000).click();
    await driver.wait(until.urlContains('/gifts'), 10000);
    await driver.navigate().refresh();

  } catch (err) {
    await driver.quit();
    throw err;
  }
});

When('I add a new gift',  {timeout : 30 * 1000}, async function () {

    await driver.wait(until.elementLocated(By.linkText('Add A Gift')), 10000).click();
    await driver.wait(until.elementLocated(By.name('name')), 10000);
    await driver.findElement(By.name('name')).sendKeys('Test Gift');
    await driver.findElement(By.name('description')).sendKeys('This is a test gift.');
    await driver.findElement(By.name('price')).sendKeys('20');
    await driver.findElement(By.name('availability')).sendKeys('10');

    const categorySelect = await driver.findElement(By.id('categorySelect'));
    await categorySelect.click();
    await categorySelect.findElement(By.css('option[value="Gadgets"]')).click();
    await driver.findElement(By.css('button[type="submit"]')).click();

});

When('I view the newly added gift', async function () {
  await driver.wait(until.elementsLocated(By.linkText('View Details')), 10000);
  const viewButtons = await driver.findElements(By.linkText('View Details'));
  await viewButtons[viewButtons.length - 1].click();
});

When('I add the gift to cart', async function () {
  await driver.findElement(By.css('button.add-to-cart-btn')).click();
  await driver.wait(until.urlContains('/gifts/cart'), 5000);
  await driver.wait(until.elementsLocated(By.css('ul li strong a')), 5000);
});

When('I navigate back to the gift from cart', async function () {
  const cartLinks = await driver.findElements(By.css('ul li strong a'));
  for (const link of cartLinks) {
    const text = await link.getText();
    if (text.includes('Test Gift')) {
      await link.click();
      break;
    }
  }
  await driver.wait(until.elementLocated(By.css('a.add-to-cart-btn')), 5000);
});

When('I edit the gift', async function () {
  const editLinks = await driver.findElements(By.css('a.add-to-cart-btn'));
  for (const link of editLinks) {
    const text = await link.getText();
    if (text.trim() === 'Edit Gift') {
      await link.click();
      break;
    }
  }

  await driver.wait(until.elementsLocated(By.name('name')), 5000);
  const titleInput = await driver.findElement(By.name('name'));
  await titleInput.clear();
  await titleInput.sendKeys('Updated Test Gift');

  const desInput = await driver.findElement(By.name('description'));
  await desInput.clear();
  await desInput.sendKeys('This is the description for updated Test Gift');

  const priceInput = await driver.findElement(By.name('price'));
  await priceInput.clear();
  await priceInput.sendKeys('25');

  await driver.findElement(By.xpath("//button[normalize-space()='✏️ Update Gift']")).click();
});

When('I send a chat message', async function () {
  await driver.wait(until.elementsLocated(By.css('.gift-item')), 10000);
  const updatedGifts = await driver.findElements(By.css('.gift-item'));
  for (const gift of updatedGifts) {
    const nameElement = await gift.findElement(By.css('.gift-name'));
    const giftName = await nameElement.getText();
    if (giftName === 'Updated Test Gift') {
      const viewDetailsBtn = await gift.findElement(By.css('.gift-detail-btn'));
      await viewDetailsBtn.click();
      break;
    }
  }

  const chatBtn = await driver.wait(until.elementLocated(By.css('button.chat-seller-btn')), 10000);
  await chatBtn.click();

  const msgInput = await driver.wait(until.elementLocated(By.id('msg')), 5000);
  await msgInput.sendKeys('Confirming payment', Key.RETURN);
});

When('I verify the payment', async function () {
  await driver.sleep(2000);
  const verifyBtn = await driver.findElement(By.css('button.verify-btn'));
  await verifyBtn.click();
});

When('I delete the gift', async function () {
  const backLink = await driver.wait(until.elementLocated(By.css('a.back-link')), 5000);
  await backLink.click();

  await driver.wait(until.elementsLocated(By.css('.gift-item')), 10000);
  const allGifts = await driver.findElements(By.css('.gift-item'));
  for (const card of allGifts) {
    const title = await card.findElement(By.css('.gift-name')).getText();
    if (title === 'Updated Test Gift') {
      const deleteButton = await card.findElement(By.css('form .delete-btn'));
      await deleteButton.click();
      console.log('Deleted gift: ', title);
      break;
    }
  }
});

Then('I should see the gift was deleted', async function () {
  await driver.quit();
});

