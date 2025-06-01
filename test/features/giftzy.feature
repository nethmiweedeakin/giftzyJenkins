Feature: Giftzy end-to-end user journey

  Scenario: Add, view, update, and delete a gift
    Given I am logged into Giftzy
    When I add a new gift
    And I view the newly added gift
    And I add the gift to cart
    And I navigate back to the gift from cart
    And I edit the gift
    And I send a chat message
    And I verify the payment
    And I delete the gift
    Then I should see the gift was deleted
