function charge_card(req, res, db, stripe){
    const token = req.body.stripeToken;
    const groupID = req.body.groupID;
    console.log('group id', groupID); 
    const groupPlanRef = db.ref(`groupPlans/${groupID}`);


    //------ GET THE AMOUNT THAT USER NEED TO PAY ------
    groupPlanRef.on("value", (snap) => {

        console.log(snap.val());

        if (snap.hasChild('amount')){
            const amount = snap.val().amount;
            console.log("Amount to pay", amount);

            // Use Stripe API to pay with amount in cents
            stripe.charges.create({
              amount: amount,
              currency: "usd",
              description: "Example charge",
              source: token
            }, (err, charge) => {
              if (err){
                console.error(err);
            }
              else {
                //TODO: change group status to Paid
                console.log("Charge:", charge);
                res.send(charge);
            }
          });
      }
      else{
          console.error("Error: Unable to find amount to charge");
      }
    });
}


exports.charge_card = charge_card;
