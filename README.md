# Revive
A light event driven based framework

A few words on Revive:
* Revive- let’s take the good parts and get rid off the complexity 
* SPA-Server based on Event Bus 
* Messages are pushed toward the SPA via WebSocket
* Internal modules are communicating via internal Event Bus
* Easy to save/restore states (we’ll get into this in details)
* No need to pre-compilation 
* Templates are welcome
* Each module is realized by JQuery Widget
* Open source (Apache licensee) 

Main components:
* Postal bus (https://github.com/postaljs/postal.js), at your will, can be easily replace by others
* Revive (https://github.com/ersh112356/)- to manage the flow of data
* Revive- to manage the states (light version of Redux- without all the hassle)
* Bootstrap- to run the templating- total optional and can easily be replaced by others
* JQuery to run the Widgets

Revive- a short introduction:
* Open source
* Very light, only 8k (1.8k minified)
* Apache license
* Learning carve
  * At top, we need only to invoke 
    * To handle the flow:
    * revive.on(“id_of_click_me","click", function(){//…});
    * revive.emit(“channel_orders",“queue_clicks",{message:"blah",qty:21});
  * To handle states:
    * revive.store(“lable_state_2", revive.asState("click_me"));
    * revive.restoreAll(“label_state_2");
  * Support metadata via attributes
    * <button id="click_me_2" type="button" class="btn btn-xs btn-info disabled" revive-data='{"channel":"orders","topic":"clicks","data":{"sku":"blah","qty":21}}' revive-type="click">Second-Click</button>

What do we need Revive for?
* For starters, we don’t- React+Redux are doing great 
  * Yet… those don't fit to small SPA applications
  * Learning carve can kill your project
  * A strong dependency- not too easy to use Redux when you don’t need React
  * A few more…
* What we get is
* A light, yet a strong MVC/SPA framework
* Very simple to write with
* The only dependencies are Postal (and lodash), JQuery- which is already there, usually 


