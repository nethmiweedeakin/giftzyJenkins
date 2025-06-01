const { setWorldConstructor } = require('@cucumber/cucumber');
const { Builder } = require('selenium-webdriver');

class CustomWorld {
  constructor() {
    this.driver = new Builder().forBrowser('chrome').build();
    this.driver.manage().setTimeouts({ implicit: 10000 });
  }

  async quitDriver() {
    if (this.driver) {
      await this.driver.quit();
    }
  }
}

setWorldConstructor(CustomWorld);
