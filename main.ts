import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { UserInfoProvider } from '../../providers/user-info/user-info';
import { Observable } from 'rxjs/Observable';
import { AlertController } from 'ionic-angular';


// List of libraries imported from the mobile app for edit-eoko-payment
import { ModalController, NavParams, ViewController } from 'ionic-angular';
import { PaymentModal } from './payment';

// Stripe element
declare var stripe: any;
declare var elements: any;

@Component({
  selector: 'add-card',
  templateUrl: 'add-card.html'
})
@Injectable()


//------- ADD CARD MODEL AFTER VIEW INIT AND ON DESTROY -------
export class AddCardModal implements AfterViewInit, OnDestroy {

  // List of elements to be used
  @ViewChild('cardInfo') cardInfo: ElementRef;
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;
  eokoData:any;
  hostURL = "http://localhost:3000/";
  savedCard: any;

  // Constructor for the add card model
  constructor(
      public afAuth: AngularFireAuth
    , public afData: AngularFireDatabase
    , private cd: ChangeDetectorRef
    , private http: HttpClient
    , public uInfo: UserInfoProvider
    , public modalCtrl: ModalController
    , public viewCtrl: ViewController
    , public alertCtrl: AlertController ) {
    console.log('Hello Add Card component');

    this.getCard();
  }

  //--------- NG AVTERVIEW AND NG ON DESTROY AND ON CHANGE -----------
  ngAfterViewInit(){
    this.card = elements.create('card')
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener('change', this.cardHandler);
  }
  ngOnDestroy(){
    this.card.removeEventListener('change', this.cardHandler);
    this.card.destroy();
   }
  onChange({error}) {
    if (error) {
      this.error = error.message;
    }
    else
      this.error = null;
    this.cd.detectChanges();
  }


  // Display any debit card information if they have added
  getCard(){
      let userID = this.uInfo.usrData.id;
      let getCustomerUrl = this.hostURL + "get_card";
      this.http.post(getCustomerUrl, {userID: userID}).subscribe(customer=> {
          console.log("CUSTOMER OBJECT", customer);
          if (customer.sources){
              this.savedCard = customer.sources.data;
          }
          else this.savedCard = [];
          console.log("Saved card", this.savedCard);
      }, failCustomer => {
          console.log("Error getting customer card", failCustomer);
      });
  }


  async onSubmit(form: NgForm){

      // Error: Unable to save card
      const { token, error } = await stripe.createToken(this.card);
      if (error) {
        console.log("Something is wrong", error);
      }


      // Success: Able to save card
      else{
        let userID = this.uInfo.usrData.id;
        let saveURL = this.hostURL + "add_card";
        let data = {
            token: token,
            userID: userID
        }

        //If successful=ly charge client, send money to owner
        this.http.post(saveURL, data).subscribe(save => {
            console.log("Add Card successfully", save);
            let alert = this.alertCtrl.create({
                title: 'Successfully Add Card',
                subTitle: 'Your Card has been added successfully',
                buttons: ['Dismiss']
            });
            alert.present();
        }, failSave => {
            console.log("Error of payment", failSave);
            let alert = this.alertCtrl.create({
                title: 'Unable to Add Card',
                subTitle: 'Unable to add this card',
                buttons: ['Dismiss']
            });
            alert.present();

        });
      }
  }


  /** Delete card
    @param {object} card: the card to be delete
  */
  deleteCard(card){
      console.log("Deleting this card", card);
      let deleteCardURL = this.hostURL + "delete_card";
      this.http.post(deleteCardURL, card).subscribe(delete_success => {
          console.log("Successfully deleting card", delete_success);
          let alert = this.alertCtrl.create({
              title: 'Successfully Delete Card',
              subTitle: 'Your card has been deleted',
              buttons: ['Dismiss']
          });
          alert.present();

      }, delete_fail => {
          console.log("Fail to delete card", delete_fail);
          let alert = this.alertCtrl.create({
              title: 'Unable to delete card',
              subTitle: 'Either your card has already been deleted or your account has been terminated',
              buttons: ['Dismiss']
          });
          alert.present();
      });
  }

  // Function to dismiss the modal
  dismiss(){
    this.viewCtrl.dismiss();
  }

  // Refresher function to get card
  doRefresh(refresher) {
   setTimeout(() => {
     console.log('Async operation has ended');
     refresher.complete();
     this.getCard();
   }, 2000);
 }
}
