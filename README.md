# stripe_integration
An Express function that integrate Stripe API for customer payment 

## Functions
Most important files are within functions/js_modules: 
- **add_card.js**: allow customers to add in debit card information and store as a customer object. Noted: similar cards can be added, but Stripe will store as different ID. 
- **charge_card.js**: charge a card a certain amount in USD 
- **create_plan.js**: Create a Stripe API product and plans. For more info, read [here](https://stripe.com/docs/billing/subscriptions/products-and-plans). 
- **delete_card.js**: this delete a certain card stored under a customer object. WARNING: do not attempt to delete customer objects as all card information will be lost and a new customer object under the same ID will not be able to be created 
- **get_card.js**: get card information of a customer object 
- **receive_payment**: build a charge object with a destionation which contains the bank account / card to receive the payment money 
