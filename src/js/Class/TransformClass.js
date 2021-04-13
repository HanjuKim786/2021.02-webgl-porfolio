const RotationClass = require('./RotationClass');

class TransformClass {
    constructor(position, rotationClass, scale){
        if(!position){
            this._translation = new Cesium.Cartesian3(0, 0, 0);    
        }
        else{
            this._translation = position;
        }
        
        if(!rotationClass){
            this._rotation = new RotationClass(0, 0, 0);
        }
        else{
            this._rotation = rotationClass;
        }
        
        if(!scale){
            this._scale = new Cesium.Cartesian3(1, 1, 1);
        }
        else{
            this._scale = scale;
        }
        this._transform = Cesium.Matrix4.fromTranslationRotationScale(
            new Cesium.TranslationRotationScale(
                this._translation,
                this._rotation.getQuaternion(),
                this._scale
            )
        , {});
    }

    getTransform(){
        this._transform = Cesium.Matrix4.fromTranslationRotationScale(
            new Cesium.TranslationRotationScale(
                this._translation,
                this._rotation.getQuaternion(),
                this._scale
            )
        , {});
        return this._transform;
    }
}

module.exports = TransformClass;