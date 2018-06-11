function add_card(req, res, db, stripe){
    const token = req.body.token;
    const userID = req.body.userID;
    console.log("token", token.id);

    // Create customer promise and retrieve customer promise
    var createCustomerPromise = createCustomer(token, userID, stripe);
    var retrieveCustomerPromise = createCustomerPromise.then((customer) => {
      res.send(customer);
      return true;
    },

    //Customer has already been created
    err => {
        console.log("ERROR CREATING THIS CUSOTMER!!!!!!!!!!!!!"); 

        if (err.code === "resource_already_exists"){
            console.log("Customer has already been created");
            var updatePromise = stripe.customers.createSource(userID, {source: token.id});
            updatePromise.then((customer)=> {
              res.send(customer);
              return true;
            })
            .catch(err=> {
              console.log("Unable to update customer", err);
              res.status(500).send(err);
              });
        }
        else {
            res.status(500).send(err);
            return true;
        }
    });
}

function createCustomer(token, userID, stripe){
  return stripe.customers.create({
    source: token.id,
    id: userID,
    description: `Save card for this user ${userID}`
    });
}

exports.add_card = add_card;
