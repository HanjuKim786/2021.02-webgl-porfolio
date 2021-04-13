const CircleColliderClass = require('./CircleColliderClass');

class ColliderManager{
    constructor(){
        this.colliders = [];
    }
    addCollider(c){
        this.colliders.push(c);
    }
    isCollided(p){
        for(let i = 0; i < this.colliders.length; i++){
            let o = this.colliders[i].isCollided(p);
            if(o){
                return o;
            }
        }
        return false;
    }
}

module.exports = ColliderManager;