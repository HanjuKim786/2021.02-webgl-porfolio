const { createTangentSpaceDebugPrimitive } = require("cesium");

class ColliderClass{
    constructor(_owner, _ownerIndex, _position){
        if(!_position){
            this.position = new Cesium.Cartesian3(0, 0, 0);
        }
        else{
            this.position = _position;
        }

        this.owner = null;
        if(_owner){
            this.owner = _owner;
        }
        this.ownerIndex = _ownerIndex;
    }

    isCollided(){};
}

module.exports = ColliderClass;