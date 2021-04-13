class EventClass {
    constructor(){
        this.listener = [];
        this.id = 0;
    }

    addListener(type, callback, _id){
        if(!_id){
            _id = ++this.id;
        }

        let a = 0;
        
        if(this.listener.length == 0){
            let o = {"type": type, "subscriber": []};
            this.listener.push(o);
        } else {
            let f = false;
            for(let i = 0; i < this.listener.length; i++){
                if(this.listener[i]["type"] == type){
                    f = true;    
                }
            }
            if(!f){
                let o = {"type": type, "subscriber": []};
                this.listener.push(o);
            }
        }
        
        for(let i = 0; i < this.listener.length; i++){
            if(this.listener[i]["type"] == type){
                this.listener[i]["subscriber"].push(callback);
                callback._id = _id;
                return;
            }
        }
    }
    clearListener(type){
        if(!type){
            this.listener = [];
            return;
        }

        this.listener[type] = [];
    }
    removeListener(type, id){
        if(!id){
           for(let i = 0; i < this.listener.length; i++){
                //let index = this.listener[i].indexOf(type);
                if(this.listener[i]["type"] == type){
                    this.listener[i].splice(i, 1);
                    return;
                }
            }
            return;
        }
        for(let i = 0; i < this.listener.length; i++){
            if(this.listener[i]["type"] == type){
                for(let j = 0; j < this.listener[i]["subscriber"].length; j++){
                    if(this.listener[i]["subscriber"][j]._id == id){
                        this.listener[i]["subscriber"].splice(j, 1);
                        return;
                    }       
                }
            }
        }
    }

    fire(type, e){
        for(let i = 0; i < this.listener.length; i++){
            if(this.listener[i]["type"] == type){
                for(let j = 0; j < this.listener[i]["subscriber"].length; j++){
                    this.listener[i]["subscriber"][j](e);
                }
            }
        }
    }
}

module.exports = EventClass;