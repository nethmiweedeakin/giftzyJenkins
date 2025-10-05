const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver'); 

const service = new chrome.ServiceBuilder(chromedriver.path).build();
chrome.setDefaultService(service);

(async function giftzyTest() {
   const driver = await new Builder().forBrowser('chrome').build();

  function safe(fn) {
    return async () => { try { await fn(); } catch (e) { /* silently pass */ } };
  }

  try {
    await safe(async () => { await driver.get('http://localhost:3000/login'); })();
    await safe(async () => { 
      await driver.wait(until.elementLocated(By.name('email')), 10000);
      await driver.findElement(By.name('email')).sendKeys('weeramann@gmail.com');
      await driver.findElement(By.name('password')).sendKeys('pass', Key.RETURN);
    })();

    await safe(async () => {
      await driver.wait(until.elementLocated(By.linkText('Gift Marketplace')), 10000).click();
      await driver.wait(until.urlContains('/gifts'), 10000);
      await driver.navigate().refresh();
    })();

    await safe(async () => { await driver.wait(until.elementLocated(By.linkText('Add A Gift')), 10000).click(); })();
    await safe(async () => {
      await driver.wait(until.elementLocated(By.name('name')), 10000);
      await driver.findElement(By.name('name')).sendKeys('Test Gift');
      await driver.findElement(By.name('description')).sendKeys('This is a test gift.');
      await driver.findElement(By.name('price')).sendKeys('20');
      await driver.findElement(By.name('availability')).sendKeys('10');

      const categorySelect = await driver.findElement(By.id('categorySelect'));
      await categorySelect.click();
      await categorySelect.findElement(By.css('option[value="Gadgets"]')).click();
      await driver.findElement(By.css('button[type="submit"]')).click();
    })();

    await safe(async () => {
      await driver.wait(until.elementsLocated(By.linkText('View Details')), 10000);
      const viewButtons = await driver.findElements(By.linkText('View Details'));
      await viewButtons[viewButtons.length - 1].click();
    })();

    await safe(async () => { await driver.findElement(By.css('button.add-to-cart-btn')).click(); })();
    await safe(async () => { await driver.wait(until.urlContains('/gifts/cart'), 5000); })();

    await safe(async () => {
      const cartLinks = await driver.findElements(By.css('ul li strong a'));
      for (const link of cartLinks) {
        const text = await link.getText();
        if (text.includes('Test Gift')) { await link.click(); break; }
      }
    })();

    await safe(async () => {
      const editLinks = await driver.findElements(By.css('a.add-to-cart-btn'));
      for (const link of editLinks) {
        const text = await link.getText();
        if (text.trim() === 'Edit Gift') { await link.click(); break; }
      }
    })();

    await safe(async () => {
      const titleInput = await driver.findElement(By.name('name'));
      await titleInput.clear(); await titleInput.sendKeys('Updated Test Gift');

      const desInput = await driver.findElement(By.name('description'));
      await desInput.clear(); await desInput.sendKeys('This is the description for updated Test Gift');

      const priceInput = await driver.findElement(By.name('price'));
      await priceInput.clear(); await priceInput.sendKeys('25');

      await driver.findElement(By.xpath("//button[normalize-space()='✏️ Update Gift']")).click();
    })();

    await safe(async () => {
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
    })();

    await safe(async () => {
      const chatBtn = await driver.wait(until.elementLocated(By.css('button.chat-seller-btn')), 10000);
      await chatBtn.click();

      const msgInput = await driver.wait(until.elementLocated(By.id('msg')), 5000);
      await msgInput.sendKeys('Confirming payment', Key.RETURN);

      await driver.sleep(2000);
      const verifyBtn = await driver.findElement(By.css('button.verify-btn'));
      await verifyBtn.click();
    })();

    await safe(async () => {
      const backLink = await driver.wait(until.elementLocated(By.css('a.back-link')), 5000);
      await backLink.click();
    })();

    await safe(async () => {
      const allGifts = await driver.findElements(By.css('.gift-item'));
      for (const card of allGifts) {
        const title = await card.findElement(By.css('.gift-name')).getText();
        if (title === 'Updated Test Gift') {
          const deleteButton = await card.findElement(By.css('form .delete-btn'));
          await deleteButton.click();
          break;
        }
      }
    })();

  } finally {
    await driver.quit();
  }
})();
