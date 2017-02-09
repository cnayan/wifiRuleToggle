import { Events } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/Rx';

/*
  Generated class for the RouterChannel provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class RouterChannel {

  url : string = 'http://192.168.0.1';
  adminUserName : string = "<YOUR_ROOT_USER>";
  adminPassword : string = "<YOUR_ROOT_USER_PASSWORD>";
  ruleIndex : number = -1;

  ERROR_REPORT_ID : 'router:error_report';

  session_id : any;
  is_blocked : any;

  constructor(public http: Http, public events: Events) {}

  login_and_detect_state() {
      return new Promise(resolve => this.authenticate(resolve))
      .then(status => {
        if (status) {
          this.detect_status();
        }
      });
  }

  detect_status() {
    let status_json = { "jsonrpc": "2.0", "id": 1, "method": "call", "params": [ this.session_id, "uci", "get", { "config":"firewall", "section":"@rule[" + this.ruleIndex + "]" } ] };
    this.make_remote_call(status_json)
    .subscribe(
      data => {
        let values = data['result'][1]['values']
        this.is_blocked = !('enabled' in values);
        this.events.publish('router:status_detected', this.is_blocked);
      },
      err => { console.log(err); this.events.publish(this.ERROR_REPORT_ID, err, "detect_status"); }
      );
  }

  toggleRuleState() {
    let json_obj = this.is_blocked
      ? { "jsonrpc": "2.0", "id": 1, "method": "call", "params": [ this.session_id, "uci", "set", { "config":"firewall", "section":"@rule[" + this.ruleIndex + "]", "values":{ "enabled":"0" } } ] }
      : { "jsonrpc": "2.0", "id": 1, "method": "call", "params": [ this.session_id, "uci", "delete", { "config":"firewall", "section":"@rule[" + this.ruleIndex + "]", "option":"enabled" } ] };

    this.make_remote_call(json_obj)
    .subscribe(
      data => this.commit_changes(),
      err => { console.log(err); this.events.publish(this.ERROR_REPORT_ID, err, "save_changes"); }
    );
  }

  commit_changes() {
    let json_obj = { "jsonrpc": "2.0", "id": 1, "method": "call", "params": [ this.session_id, "uci", "commit", { "config":"firewall", "section":"@rule[" + this.ruleIndex + "]" } ] };
    this.make_remote_call(json_obj)
    .subscribe(
      // reload the network to bring the change in effect
      data => this.reload_network(),
      err => { console.log(err); this.events.publish(this.ERROR_REPORT_ID, err, "commit_changes"); }
    );
  }

  reload_network() {
    let json_obj = { "jsonrpc": "2.0", "id": 1, "method": "call", "params": [ this.session_id, "network", "reload", {} ] };
    this.make_remote_call(json_obj)
    .subscribe(
      data => this.events.publish('router:changes_saved'),
      err => { console.log(err); this.events.publish(this.ERROR_REPORT_ID, err, "reload_network"); }
    );
  }

  authenticate(resolve) {
    let auth_json = { "jsonrpc": "2.0", "id": 1, "method": "call", "params": [ "00000000000000000000000000000000", "session", "login", { "username": this.adminUserName, "password": this.adminPassword} ] };
    this.make_remote_call(auth_json)
    .subscribe(
      data => {
        this.session_id = data['result'][1]['ubus_rpc_session'];
        resolve(true);
      },
      err => {
        console.log(err);
        this.events.publish(this.ERROR_REPORT_ID, err, "authenticate");
        resolve(false);
      }
    );
  }

  make_remote_call(json_obj) {
    let headers = new Headers({
      'Content-type': 'application/json'
    });

    let options = new RequestOptions({ headers: headers });
    return this.http.post(this.url + '/ubus', json_obj, options).map(response => response.json());
  }

}
