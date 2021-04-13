const { Rotation } = require("cesium");
const commonUtil = require("../Util");

class RotationClass{
    constructor(yaw, pitch, roll, ellipsoid){
        this._yaw = yaw;
        this._pitch = pitch;
        this._roll = roll;

        this._ellipsoid = ellipsoid;
    }

    fromlnglat(lng, lat){
        //FRONTFACE
        this._yaw = lng * -1;
        this._pitch = Math.PI + lat;
        this._roll = 0;
    }

    fromCartesian3(x, y, z){
        let position = new Cesium.Cartesian3(x, y, z);
        //yaw pitch roll 갱신
        let cesiumCarto = Cesium.Cartographic.fromCartesian(position, this._ellipsoid);
        this._yaw = cesiumCarto.longitude * -1;
        //this._yaw = 0;
        this._pitch = Math.PI + cesiumCarto.latitude;
        this._roll = 0;
    }

    lookAtCenterFromCartesian3(x, y, z, offsetY){
        let _offsetY = 0;
        if(offsetY){
            _offsetY = offsetY;
        }
        
        //안쪽을 바라본다
        let position = new Cesium.Cartesian3(x, y, z);
        //yaw pitch roll 갱신
        let cesiumCarto = Cesium.Cartographic.fromCartesian(position, this._ellipsoid);
        let pitchOffset = (x >= 0 ) ? 0 : +Math.PI; //실제 보이는 뷰를 기준으로 pitch라고 명명함
        this._yaw = cesiumCarto.longitude * -1 + pitchOffset;
        let yawDir = (x >= 0) ? 1 : -1; //실제 보이는 뷰를 기준으로 yaw라고 명명함
        this._pitch = (cesiumCarto.latitude + offsetY) * yawDir;
        this._roll = 0;
    }

    addRoll(rad){
        this._roll += rad;
    }

    getQuaternion(){
        return Cesium.Quaternion.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(this._yaw, this._pitch, this._roll));
    }
    getRotationMatirx(){
        return Cesium.Matrix3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(this._yaw, this._pitch, this._roll));
    }
}

module.exports = RotationClass;