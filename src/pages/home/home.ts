import { Events } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { Component } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { RouterChannel } from "../../providers/router-channel";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  loader: any;

  is_blocked: boolean = false;
  greeting: string = "";
  action_message: string = "";

  ok_button_invisible: boolean = false;
  cancelButtonText: string = "No";

  constructor(
    public platform: Platform,
    public loadingControl: LoadingController,
    public router: RouterChannel,
    public events: Events) {

    this.platform.ready().then(() => {
      this.platform.registerBackButtonAction(() =>
        this.platform.exitApp());

      events.subscribe('router:status_detected', is_blocked => {
        this.is_blocked = is_blocked;
        this.greeting = "Phone is " + (this.is_blocked ? "blocked" : "unblocked") + ".";
        this.action_message = "Do you want to " + (this.is_blocked ? "unblock" : "block") + " the phone?";
      });

      events.subscribe('router:changes_saved', () => {
        this.greeting = "Phone " + (this.is_blocked ? "enabled" : "disabled") + ".";
        this.action_message = "";
        this.ok_button_invisible = true;
        this.cancelButtonText = "Close";
      });

      // On error event, log the error
      events.subscribe('router:error_report', (msg, location) => {
        this.greeting = "Error: [" + location + "] - " + msg;
        this.action_message = "";
      });

      this.presentLoading();

      router.login_and_detect_state().then(() => this.loader.dismiss());
    });
  }

  presentLoading() {
    this.loader = this.loadingControl.create({
      content: "Checking current status..."
    });

    this.loader.present();
  }

  okCancelClicked() {
     // Exit app
    this.platform.exitApp();
  }

  okClicked() {
    // User wants to change state of the rule
    this.router.toggleRuleState();
  }

}
