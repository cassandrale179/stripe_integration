const express = require('express');
const path = require('path');
const app = express();
const stripe = require("stripe")("test_key");

//------------- INITIALIZE FIREBASE ADMIN ------------
const admin = require('firebase-admin');
var serviceAccount = require(path.join(__dirname, 'service-account.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://database.firebaseio.com'
});


//---------------- BODY PARSER ------------------
const db = admin.database();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use( (req, res, next)=> {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//----------- LIST OF MODULES TO USE ----------
const createPlanModule = require('./js_modules/create_plan.js');
const chargeCardModule = require('./js_modules/charge_card.js');
const receivePaymentModule = require('./js_modules/receive_payment.js');
const addCardModule = require('./js_modules/add_card.js');
const getCustomerModule = require('./js_modules/get_card.js');
const deleteCardModule = require('./js_modules/delete_card.js');

//--------- LIST OF GLOBAL VARIABLES -------
const ACCOUNT_ID = 'acct_1CZ5X4G0qdBASsxU';
const CARD_ID = 'card_1CZ5YaG0qdBASsxU4m9ozHce';
const ACCOUNT_ID2 = 'acct_1CZ6MWIRdq7xdhJS';

//------ DELETE PLANS OF A PRODUCT --------
function deletePlans(){
    stripe.plans.list((err, plans) => {
        for (var i = 0; i < plans.data.length; i++){
            var planid = plans.data[i].id;
            stripe.plans.del(planid, (err, confirmation) => {
                    if (err) console.log(err);
                    else console.log("Delete plan", confirmation);
                }
            );
        }
      }
    );
}


/** ----------- DELETE PRODUCT GIVEN AN ID -----------
 * One time charge
 * @param  {[string]} productid [pass in a product id to delete it]
 */
function deleteProducts(productid){
    stripe.products.del(productid, function(err, confirmation){
        if (err){
            console.log(err.code);
        }
        else console.log(confirmation);
    });
    stripe.products.list(
      function(err, products) {
        for (var i =0 ; i < products.data.length; i++){
            stripe.products.del(products.data[i].id,
                (err, confirmation) => {
                    if (err) console.log('[Error: ] Unable to delete plan', err.message);
                    else console.log(confirmation);
            });
        }
      }
    );
}


function createAccount(){
    //Step 1: Create a custom account
   stripe.accounts.create({
     country: "US",
     type: "custom",
     email: "michaelle7312@gmail.com",
   }).then(function(acct) {
       console.log("Account", acct);
   }).then(success => {
     console.log(success);
   }).catch(err => {
     console.log(err);
   });
   //Step 2: Store the ID of the account and its associate secret key
}


//---- CREATE AN EXTERNAL BANK ACCOUNT TO RETRIEVE MONEY -------
function createCharge(accountid){
    //https://stripe.com/docs/connect/testing
    stripe.charges.create({
         amount: 10000,
         currency: "usd",
         source: "tok_visa",
         destination: {
           account: accountid,
           amount: 9000
        },
    }).then(function(charge) {
         console.log(charge);
    }).catch(err =>  console.log(err));
    //Step 3: Create a charge (secret key should be a different account)
}


function retrieveInfo(){

    //Retrieve detail of an account
    stripe.accounts.retrieve(
        ACCOUNT_ID2,
        function(err, account) {
            if (err) console.log(err);
            else console.log(account);

        }
    );

    //Retrieve a list of all account
    stripe.accounts.list(
      function(err, accounts) {
        if (err) console.log(err);
        else console.log("Accounts", accounts);
      }
    );

    //Retrieve all account balance
    stripe.balance.retrieve({
      stripe_account: "acct_1CZ5X4G0qdBASsxU"
    }, function(err, balance) {
        if (err) console.log(err);
      console.log(balance);
    });
}


function retrieveCustomer(){
    stripe.customers.list(
      { limit: 3 },
      function(err, customers) {
        console.log("LISTING ALL CUSTOMERS!!!!!!!!!!!!", customers);
      }
    );
}

app.get('/timestamp', (request, response) => {
    response.send(`The port is running successfully. The timestamp: ${Date.now()}`);
});


//-------- CREATE A PLAN BY OWNER OF EOKO -------
app.post("/create_plan", (req, res) => {
    /**
        @param res: pass in the plan info
        {
        amount: '100',
        ID: 'XXXX',
        name: 'Plan Name',
        interval: 'month',
        productID: 'XXXX',
        status: 'paid'
        }
    **/
    console.log("Req, res", req.body);
    createPlanModule.create_plan(req, res, db, stripe);
});


//------- CREATE A CHARGE OBJECT WHEN USER PAY --------
app.post("/charge_card", (req, res) => {
    chargeCardModule.charge_card(req, res, db, stripe);
});


//------- SEND MONEY TO THE OWNER'S ACCOUNT --------
app.post("/receive_payment", (req, res) => {
    receivePaymentModule.receive_payment(req, res, db, stripe);
});

//------- WHEN USER WANT TO SAVE CARD --------
app.post("/add_card", (req, res) => {
    addCardModule.add_card(req, res, db, stripe);
});


//------- GET CUSTOMER CARD INFROMATION -------
app.post("/get_card", (req, res) => {
     getCustomerModule.get_card(req, res, db, stripe);
});


//------ DELETE CARD -------
app.post("/delete_card", (req, res) => {
    deleteCardModule.delete_card(req, res, db, stripe);
});

//------- OPEN THE PORT ON 3000 --------
app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
