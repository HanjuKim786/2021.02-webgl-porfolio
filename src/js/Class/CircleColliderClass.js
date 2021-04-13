const ColliderClass = require('./ColliderClass');

class CircleColliderClass extends ColliderClass
{
    constructor(_owner, _ownerIndex, _position,_radius){
        super(_owner, _ownerIndex, _position);
        this.radius = _radius;
    }

    isCollided(p){
        let d = Cesium.Cartesian3.distance(this.position, p);
        if(d > this.radius){
            return false;
        }else{
            console.log(this.ownerIndex);
            console.log(p);
            //console.log(projectionPoint);
            return this.owner;
        }
    }
}

module.exports = CircleColliderClass;