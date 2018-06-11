function receive_payment(req, res, db, stripe){
    console.log('Receive payment is being called inside the function!!!!');
    var groupID = req.body.groupID;
    var amount = req.body.amount;
    var groupOwnerAccountID = '';
    var groupAccountID = '';

    var chargeAmount = amount * 0.90;
    var groupFee = amount * 0.10;
    console.log("Charge amount", chargeAmount);
    console.log("group fee", groupFee);


    //-------- GIVE THE FUND TO THE OWNER ------
    stripe.charges.create({
         amount: chargeAmount,
         currency: "usd",
         source: "tok_visa",
         destination: {
           account: groupOwnerAccountID,
           amount: chargeAmount
        },
    }).then(function(charge) {
         console.log("Pay to owner");
    }).catch(err =>  console.log(err));


    //-------- GIVE THE FUND TO THE group ------
    stripe.charges.create({
         amount: groupFee,
         currency: "usd",
         source: "tok_visa",
         destination: {
           account: groupAccountID,
           amount: groupFee
        },
    }).then(function(charge) {
         console.log("Pay to group");
    }).catch(err =>  console.log(err));
}
exports.receive_payment = receive_payment;
