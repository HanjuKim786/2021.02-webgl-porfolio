const commonUtil = require('../Util');

class RayClass{
    constructor(_gl, _scene){
        this.gl = _gl;
        this.scene = _scene;
        this.camera = this.scene.camera;
    }
    rayFromWindow(x, y){
        let width = this.gl.canvas.clientWidth;
        let height = this.gl.canvas.clientHeight;

        //0,0을 카메라의 위치에서 zNear만큼 앞으로간 위치라고 할때 이 위치에서 상대적인 거리로 x, y를 변환한다
        x = x - width/2;
        y = y - height/2;
        
        x /= (width/2);
        y /= (width/2);

        y *= this.camera.aspect;

        y *= -1;

        //화면상의 좌표 월드 좌표로 변환
        let relativeCoord = new Cesium.Cartesian3(0, y, x);
        console.log("relativeCoord : ");
        console.log(relativeCoord);

        let viewCoordFromRelativeCoord = Cesium.Matrix4.multiplyByPoint(this.camera.ProjectionviewMatrix,relativeCoord,{});
        console.log("viewCoordFromRelativeCoord : ");
        console.log(viewCoordFromRelativeCoord);
        let originWorldCoordFromNearCoord = new Cesium.Cartesian3(0, 0, (Cesium.Cartesian3.magnitude(this.camera.position) - (1.732050*2)) + (1.732050*2));


        console.log("originCoordFromViewCoordFromRelativeCoord");
        console.log(originWorldCoordFromNearCoord);

        //ray 생성
        let dir = Cesium.Cartesian3.subtract(viewCoordFromRelativeCoord, originWorldCoordFromNearCoord, {});
        Cesium.Cartesian3.normalize(dir, dir);
        
        let rotation = Cesium.Matrix4.fromTranslationQuaternionRotationScale(new Cesium.Cartesian3(0, 0, 0), this.camera.rotation.getQuaternion(), new Cesium.Cartesian3(1, 1, 1));
        
        Cesium.Matrix4.multiplyByPoint(rotation, dir, dir);
        return dir;
    }
}

module.exports = RayClass;