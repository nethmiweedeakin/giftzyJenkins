const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver'); 

(async function giftzyTest() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get('http://localhost:3000/login');
    await driver.wait(until.elementLocated(By.name('email')), 10000);
    await driver.findElement(By.name('email')).sendKeys('weeramann@gmail.com');
    await driver.findElement(By.name('password')).sendKeys('pass', Key.RETURN);

    await driver.wait(until.elementLocated(By.linkText('Gift Marketplace')), 10000).click();
    await driver.wait(until.urlContains('/gifts'), 10000);
    await driver.navigate().refresh();

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

    // View last added gift
    await driver.wait(until.elementsLocated(By.linkText('View Details')), 10000);
    const viewButtons = await driver.findElements(By.linkText('View Details'));
    await viewButtons[viewButtons.length - 1].click();

    // Add to cart
    await driver.findElement(By.css('button.add-to-cart-btn')).click();

    // Wait for cart page to load
    await driver.wait(until.urlContains('/gifts/cart'), 5000);

    // Wait for the cart list to show up
    await driver.wait(until.elementsLocated(By.css('ul li strong a')), 5000);

    // Click the gift name link in the cart to go back to detail
    const cartLinks = await driver.findElements(By.css('ul li strong a'));
    for (const link of cartLinks) {
      const text = await link.getText();
      if (text.includes('Test Gift')) {
        await link.click();
        break;
      }
    }
// Wait until the Edit Gift link with the correct class is present
await driver.wait(until.elementLocated(By.css('a.add-to-cart-btn')), 5000);

const editLinks = await driver.findElements(By.css('a.add-to-cart-btn'));
for (const link of editLinks) {
  const text = await link.getText();
  if (text.trim() === 'Edit Gift') {
    await link.click();
    break;
  }
}


    // Update gift
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

    // Locate updated gift again
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

    // Chat with seller
    const chatBtn = await driver.wait(until.elementLocated(By.css('button.chat-seller-btn')), 10000);
    await chatBtn.click();

    const msgInput = await driver.wait(until.elementLocated(By.id('msg')), 5000);
    await msgInput.sendKeys('Confirming payment', Key.RETURN);

    // Wait before verifying payment
    await driver.sleep(2000); // Wait for message to be sent
    const verifyBtn = await driver.findElement(By.css('button.verify-btn'));
    await verifyBtn.click();

    // Go back to gift list
    const backLink = await driver.wait(until.elementLocated(By.css('a.back-link')), 5000);
    await backLink.click();

    // Wait for the list and locate the gift again
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

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await driver.quit();
  }
})();
