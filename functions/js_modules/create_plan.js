function create_plan(req, res, db, stripe){
    console.log('Creating plan is being called');
    var clientPlanInfo = req.body;
    var id = clientPlanInfo.id;

    if (id){
        if (clientPlanInfo.status === 'paid'){
            var planRef = db.ref(`plans/${id}`);
            planRef.on("value", (snap) => {


            //A product has already been created for this group 
            if (snap && snap.hasChild("productID")){
                var productID = snap.val().productID;
                var planPromise = createPlan(
                    productID,
                    clientPlanInfo.amount,
                    clientPlanInfo.name,
                    clientPlanInfo.interval
                );
                planPromise.then(planInfo => {
                  res.send(planInfo);
                  return true;
                })
                .catch(err=> {
                  console.log("err", err);
                  res.status(500).send(err);
                  return null;
              });

            }


            //Create a new product for this group
            else {
                var newProductPromise = createProduct(clientPlanInfo.name, clientPlanInfo.id);
                var newPlanPromise = newProductPromise.then(productInfo => {
                    planRef.update({
                        productID: productInfo.id
                    });
                    return createPlan(
                        productInfo.id,
                        clientPlanInfo.amount,
                        clientPlanInfo.name,
                        clientPlanInfo.interval
                    );
                });

                Promise.all([newProductPromise, newPlanPromise]).then(results=> {
                    var productInfo = results[0];
                    var planInfo = results[1];
                    // console.log(planInfo);
                    res.send(planInfo);
                    return true;
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Error creating plan");
                    return true;
                });
            }
        });
        }
        else if (clientPlanInfo.status === "free") {
            //TODO: change all customers subscription to free
            res.send(true);
        }
    }
    else console.log("Error: Unable to get ID");

    //--------- FUNCTION TO CREATE PLAN -------
    function createPlan(productID, amount, nickname, interval, currency){
      return stripe.plans.create({
        product: productID,
        currency: currency || "usd",
        interval: interval,
        nickname: nickname,
        amount: parseFloat(amount)
        });
    }


    //------- FUNCTION TO CREATE PRODUCT -------
    function createProduct(productName, ID, type="service"){
        return stripe.products.create({
            name: productName,
            id: ID,
            type: type,
        });
    }

}



exports.create_plan = create_plan;
