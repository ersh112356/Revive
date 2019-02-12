/* 
 * Version 1.1
 *
 * A Controller object to run the lifecycle of a model.
 * Works in conjunction with Jquery.
 * At default, Postal is used as the Broker, yet that can be customized.
 * 
 * @param broker- the broker that recieves messages. 
 */
var Revive = function(brokerImpl){
 
    /** The value of the timeout (30 seconds) for replying to a message. */
    var TIMEOUT = 30000;
    /** Holds the states that are stored here. */
    var states = {};
    /** Holds the broker. */
    var broker = brokerImpl;
    /** Holds the registered clients to the bus. */
    var clients = {};
    /** Holds the services to discover. */
    var services = {};
 
    /**
     * Clean the store.
     * 
     * @return this object for chaining.
     */
    this.clear = function(){
        
        states = {};
        
        return this;
    };
    
    /**
     * Introduce a new broker here.
     * 
     * @param brokerImpl - the broker.
     * 
     * @return this object for chaining.
     */
    this.setBroker = function(brokerImpl){
        
        broker = brokerImpl;
        
        return this;
    };
 
    /**
     * Try to emit the model with a new message.
     * 
     * @param channel - the channel to register to.
     * @param topic - the topic in the channel to register to.
     * @param data - the data to send to.
     * @param callback - an optional callback to handle the reply to the message sent.
     * 
     * @return this object for chaining.
     */
    this.emit = function(channel, topic, data, callback){
        
        if(callback)
        {
            var subscription = broker.subscribe({
                channel: channel,
                topic: topic+"_reply",
                callback: function(data,envelope){
                    subscription.unsubscribe();
                    clearTimeout(t);
                    callback(data,envelope);
                }
            });

            // The reply is cleared after 30 seconds.
            var t = setTimeout(function(){ 
                subscription.unsubscribe();
            }, TIMEOUT);
        }
        
        broker.publish({
            channel: channel,
            topic: topic,
            data: data
        });
        
        return this;
    };
    
    /**
     * Try to apply on a registration to the model.
     * 
     * @param channel - the channel to register to.
     * @param topic - the topic in the channel to register to.
     * @param identification - the identification of the client. Optional.
     * @param callback - the callback to apply by.
     * 
     * @return this object for chaining.
     */
    this.apply = function(channel, topic, identification, callback){
        
        if(typeof identification==='function')
        {   // Actually we omitted the identification and provided with the callback.
            applyNotIdentified(channel,topic,identification);
        }
        else
        {
            applyIdentified(channel,topic,identification,callback);
        }
        
        return this;
    };
    
    /**
     * Try to apply on a registration to the model.
     * 
     * @param channel - the channel to register to.
     * @param topic - the topic in the channel to register to.
     * @param callback - the callback to apply by.
     * 
     * @return this object for chaining.
     */
    var applyNotIdentified = function(channel, topic, callback){
        
        var subscription = broker.subscribe({
            channel: channel,
            topic: topic,
            callback: function(data,envelope){
                var en = new binder(envelope);
                callback(data,en);
            }
        });
        
        var key = channel+"."+topic;
        var arr = clients[key];
        
        if(!arr)
        {
            arr = [];
        }
        
        arr.push(subscription);
        clients[key] = arr;
    };
    
    /**
     * Try to apply on a registration to the model.
     * 
     * @param channel - the channel to register to.
     * @param topic - the topic in the channel to register to.
     * @param identification - the identification of the client.
     * @param callback - the callback to apply by.
     * 
     * @return this object for chaining.
     */
    var applyIdentified = function(channel, topic, identification, callback){
        
        var subscription = broker.subscribe({
            channel: channel,
            topic: topic,
            callback: function(data,envelope){
                var en = new binder(envelope);
                callback(data,en);
            }
        });
        
        subscription.identification = identification;
        var key = channel+"."+topic;
        var arr = clients[key];
        
        if(!arr)
        {
            arr = [];
        }
        
        arr.push(subscription);
        clients[key] = arr;
    };
    
    /**
     * Try to unsubscribe to scpecified channel and topic.
     * 
     * @param channel - the channel to unsubscribe to.
     * @param topic - the topic to unsubscribe to.
     * @param identification - the identification of the client to remove. Optional.
     * 
     * @returns this object for chaining. 
     */
    this.unapply = function(channel, topic, identification){
        
        if(identification)
        {
            unapplyIdentified(channel,topic,identification);
        }
        else
        {
            unapplyNotIdentified(channel,topic);
        }
        
        return this;
    };
    
    /**
     * Try to unsubscribe to scpecified channel and topic.
     * 
     * @param channel - the channel to unsubscribe to.
     * @param topic - the topic to unsubscribe to.
     */
    var unapplyNotIdentified = function(channel, topic){
        
        try
        {
            var key = channel+"."+topic;
            var arr = clients[key];
            
            if(arr)
            {
                for(var i=0;i<arr.length;i++)
                {
                    arr[i].unsubscribe();
                }
            }
            
            clients[key] = [];
        }
        catch(error)
        {
        }
    };
    
    /**
     * Try to unsubscribe a given client from scpecified channel and topic.
     * 
     * @param channel - the channel to unsubscribe to.
     * @param topic - the topic to unsubscribe to.
     * @param identification - the identification of the client to remove.
     */
    var unapplyIdentified = function(channel, topic, identification){
        
        try
        {
            var key = channel+"."+topic;
            var arr = clients[key];
            
            if(arr)
            {
                for(var i=0;i<arr.length;i++)
                {
                    var sb = arr[i];
                    
                    if(sb.identification===identification)
                    {
                        sb.unsubscribe();
                        arr.splice(i,1);

                        break;
                    }
                }
            }
        }
        catch(error)
        {
        }
    };
    
    /**
     * Try to publish a new ID of an element.
     * 
     * @param label - the label that tied to the ID.
     * @param elemID - the ID of an element.
     * 
     * @returns this to allow chaining.
     */
    this.publish = function(label ,elemID){
        
        services[label] = elemID;
        
        return this;
    };
    
    /**
     * Return the ID by its label.
     * 
     * @param label - the label to find by.
     * 
     * @returns the ID.
     * 
     */
    this.getRecord = function(label){
        
        return services[label];
    };
    
    /**
     * A quick wrapper for catching events from an element.
     * 
     * @param id - the id of the element that triggers the event.
     * @param type - the type of the event to catch.
     * @param fn - the callback function.
     * 
     * @return this object for chaining.
     */
    this.on = function(id, type, fn){
        
        var elem = $("#"+id);
        elem.on(type,function(event){
            if(type==="click" && elem.attr("disabled"))
            {   // Disabled, just block the event.
                // Actually, that's not needed and can be removed.
                event.preventDefault();
                
                return;
            }
            
            fn(event);
            event.preventDefault();
        });
        
        return this;
    };
    
    /**
     * Returns the state of a given element.
     * 
     * @param id - the id of the lement.
     *  
     * @return the state of a given element.
     */
    this.asState = function(id){
        
        var state = {};
        var elem = $("#"+id);
        state["html"] = elem.html();
        state["text"] = elem.text();
        state["css"] = elem.attr("style");
        state["class"] = elem.attr("class");
        state["id"] = id;
        state["disabled"] = elem.attr("disabled");
        state["src"] = elem.attr("src");
        state["href"] = elem.attr("href");
        state["width"] = elem.attr("width");
        state["height"] = elem.attr("height");
        state["alt"] = elem.attr("alt");
        state["title"] = elem.attr("title");
        state["checked"] = elem.attr("checked");
        state["selected"] = elem.attr("selected");
        
        return state;
    };
    
    /**
     * Add a new state to the store.
     * Might be a single state, or multiple states.
     * 
     * @param label - the label tied to the state.
     * @param state - the state itself.
     * 
     * @return this object for chaining.
     */
    this.store = function(label, state){
        
        states[label] = state;
        
        return this;
    };
    
    /**
     * Restore a batch of elements.
     * 
     * @param label - the label of the states to restore.
     * 
     * @return this object for chaining.
     */
    this.restoreAll = function(label){

        var multiStates = states[label];
        
        try
        {
            multiStates.forEach(function(state){
                restoreState(state);
            });
        }
        catch(error)
        {   // Die gracefully. That's probably due to one that's not defined well.
        }
        
        return this;
    };
    
    /**
     * Restore a specified state.
     * 
     * @param label - the label which is tied to the state.
     * 
     * @return this object for chaining.
     */
    this.restore = function(label){
        
        var state = states[label];
        restoreState(state);
        
        return this;
    };
    
    /**
     * Restore a given state.
     * 
     * @param state - the state to restore.
     */
    var restoreState = function(state){
        
        var id = state.id;
        
        if(state.html)
        {
            html(id,state.html);
        }
        else if(state.text)
        {   // Both can't go thogether.
            text(id,state.text);
        }
        
        if(state.css)
        {
            css(id,state.css);
        }
        
        sync(id,"class",state.class);
        sync(id,"src",state.src);
        sync(id,"href",state.href);
        sync(id,"width",state.width);
        sync(id,"height",state.height);
        sync(id,"alt",state.alt);
        sync(id,"title",state.title);
        sync(id,"disabled",state.disabled);
        sync(id,"checked",state.checked);
        sync(id,"selected",state.selected);
    };
    
    /**
     * Set the html attribute into a given element.
     * 
     * @param id - the id of the element to set in.
     * @param html - the html to set.
     */
    var html = function(id, html){

        $("#"+id).html(html);
    };
    
    /**
     * Set the text attribute into a given element.
     * 
     * @param id - the id of the element to set in.
     * @param text - the text to set.
     */
    var text = function(id, text){

        $("#"+id).text(text);
    };

    /**
     * Set css attribute into a given element.
     * 
     * @param id - the id of the element to set in.
     * @param css - the css to add.
     */
    var css = function(id, css){

        $("#"+id).css(css);
    };
    
    /**
     * Try to sync a given attribute into the element.
     * 
     * @param id - the id of the element.
     * @param name - the name of the attribute.
     * @param attr - the attribute itself.
     */
    var sync = function(id, name, attr){
        
        var elem = $("#"+id);
        
        if(attr)
        {   // Should exist, we need to sync into the element.
            elem.attr(name,attr);
        }
        else
        {   // Not exists, need to be removed. 
            elem.removeAttr(name);
        }
    };
    
    /**
     * An object to handle the functionality of a reply to a message.
     * 
     * @param envelope - the original envelope.
     * 
     * @returns the Binder objectg.
     */
    var binder = function(envelope){
        
        return {
            channel : envelope.channel,
            topic : envelope.topic,
            timeStamp : envelope.timeStamp,
            data : envelope.data,
            reply : function(message){
                 broker.publish({
                    channel: envelope.channel,
                    topic: envelope.topic+"_reply",
                    data: message
                });
        }};
    };
};

// Create a new instance of Revivve.
// Please not, this creates a dependency on Pastal, so it might be removed..
revive = new Revive(this.postal);
/**
 * That's an elegant way of an implementation for revive.on(), above.
 */
(function(){ 
    var elements = document.querySelectorAll('[revive-data]');
    
    if(elements)
    {
        for(var i=0;i<elements.length;i++)
        {
            var data = elements[i].getAttribute('revive-data');
            var fn = elements[i].getAttribute('revive-fn');
            var id = elements[i].getAttribute('id');
            var type = elements[i].getAttribute('revive-type');
            
            if(fn)
            {   
                revive.on(id,type,function(event){
                    // That will only work if the function is declared global.
                    // AKA, window.fn = function().
                    var fun = window[fn];

                    if(typeof fun==='function')
                    {
                        fun(event,data);
                        event.preventDefault();
                    } 
                });
            }
            else
            {   // Will trigger firing a message on click.
                var json = JSON.parse(data);
                
                revive.on(id,type,function(event){
                    revive.emit(json.channel,json.topic,json.data);
                });
            }
        }
    }
})();
