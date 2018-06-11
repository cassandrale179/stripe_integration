function get_card(req, res, db, stripe){
    console.log("Calling the function get customer");
    const userID = req.body.userID;
    stripe.customers.retrieve(userID).then((customer)=> {
        console.log("Successfull getting card information");
        res.send(customer);
        return true;
    })
    .catch(err=> {
      res.status(500).send(err);
    });
}
exports.get_card = get_card;
