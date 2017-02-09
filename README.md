# wifiRuleToggle
Ionic 2 App sample, to interact with OpenWRT UCI

This app interacts with your router running on OpenWRT firmware using JSON RPC.

More details about OpenWRT UCI can be found here: https://wiki.openwrt.org/doc/uci

This is a simple app which I created while learning Ionic 2, Angular and Cordova.

<H1>What it does</H1>
This app toggles the state, on / off, of a rule that you configure on your router using the web interface.

<H1>How to use</H1>
If you wish to use this app, then you must configure these 4 things in 'router-channel.ts' file:
<ul>
  <li>url - This points to the router's IP. Example: http://192.168.0.1</li>
  <li>adminUserName - This is your admin user name</li>
  <li>adminPassword - This is your corresponding admin password</li>
  <li>ruleIndex - This is the index of the firewall (traffic) rule that you have already must have configured on your router</li>
</ul>

For me, the rule was configured to "deny" any access to internet for a specified MAC address. The default state of the rule is configured to be "off". Thus this app behaves accordingly.

Hope this application helps you in understanding how to use JSON RPC to interact with UCI of OpenWRT.
