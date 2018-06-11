function delete_card(req, res, db, stripe){
    let customerID = req.body.customer;
    let cardID = req.body.id;
    if (customerID &&  cardID){
        stripe.customers.deleteCard(customerID, cardID,
          function(err, confirmation) {
              if (err){
                  console.log("Unable to delete this card", err);
                  res.status(500).send(err);
              }
              else{
                  console.log("Successfully deleting this card", confirmation);
                  res.send(confirmation);
              }
          }
        );
    }
    else{
        console.log("Unable to retrieve either customer ID or card ID");
    }

}
exports.delete_card = delete_card;
