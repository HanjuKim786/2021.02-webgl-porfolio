const { Cartesian2 } = require('cesium');
const RotationClass = require('./RotationClass');
const commonUtil = require('../Util');

class CameraClass{
    constructor(_gl, _scene){
        this.gl = _gl;
        this.scene = _scene;
        this.aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        this.zNear = 1;
        this.zFar = 2000;
        this.position = new Cesium.Cartesian3(global.__RADIUS + 300 + 2000, 0, 0);
        this.projectionMatrix = Cesium.Matrix4.computePerspectiveFieldOfView(commonUtil.degToRad(60), this.aspect, this.zNear, this.zFar, {});
        //변경사항(이동,회전 등등)을 종합해서 한번에 cameraMatrix에 반영할 임시 트랜스폼
        //Rotation Class
        let ellipsoid = new Cesium.Ellipsoid(global.__RADIUS, global.__RADIUS, global.__RADIUS);
        this.rotation = new RotationClass(0, -Math.PI/2, 0, ellipsoid);
        this.cameraMatrix = this.computeTranslationRotationCamaraMatirx();
        this.viewMatrix = Cesium.Matrix4.inverse(this.cameraMatrix,{});
        this.ProjectionviewMatrix = Cesium.Matrix4.multiply(this.projectionMatrix, this.viewMatrix, {});
        
        this.xAxis = new Cesium.Cartesian3(1, 0, 0);
        this.yAxis = new Cesium.Cartesian3(0, 0, -1);
        this.zAxis = new Cesium.Cartesian3(0, 1, 0);
        
        this._renewTransform = false;

        let self = this;
        this.scene.eventManager.addListener("mousedown", (e)=>{
            self._mousedownX = e.clientX;
            self._mousedownY = e.clientY;

            self._mousedownXratio = self._mousedownX / self.gl.canvas.clientWidth;
            self._mousedownYratio = self._mousedownY / self.gl.canvas.clientHeight;

            self._isClicked = true;
        });
        this.scene.eventManager.addListener("mousemove", (e)=>{
            if(self._isClicked){
                let factor = 0.5;
                self.moveZAxis(e.movementX / self.gl.canvas.clientHeight * Cesium.Cartesian3.magnitude(this.position) * factor * -1);
                self.lookAt(new Cesium.Cartesian3(0,0,0));
            }
        });
        this.scene.eventManager.addListener("mouseup", (e)=>{
            self._isClicked = false;
        });
        this.scene.eventManager.addListener("mousewheel", (e)=>{
            let factor = 0.1;
            self.moveXAxis(e.wheelDelta / this.gl.canvas.clientHeight * Cesium.Cartesian3.magnitude(this.position) * factor);
        });
    }
    moveXAxis(distance){
        let delta = new Cesium.Cartesian3(distance * this.xAxis.x, distance * this.xAxis.y, distance * this.xAxis.z);
        Cesium.Cartesian3.add(this.position, delta, this.position);

        this._renewTransform = true;
    }
    moveYAxis(distance){
        let delta = new Cesium.Cartesian3(distance * this.yAxis.x, distance * this.yAxis.y, distance * this.yAxis.z);
        
        Cesium.Cartesian3.add(this.position, delta, this.position);
        
        this._renewTransform = true;
    }
    moveZAxis(distance){
        let delta = new Cesium.Cartesian3(distance * this.zAxis.x, distance * this.zAxis.y, distance * this.zAxis.z);
        Cesium.Cartesian3.add(this.position, delta, this.position);
        this._renewTransform = true;
    }

    rotateRoll(rad){
        this.rotation.addRoll(rad);
        this._renewTransform = true;
        this.update();
    }

    update(){
        this.updateTransform();
    }

    updateTransform(){
        if(!this._renewTransform)
            return;

        //get current rotation matrix
        let RotMat3 = this.rotation.getRotationMatirx();
        this.cameraMatrix = this.computeTranslationRotationCamaraMatirx();
        
        this.viewMatrix = Cesium.Matrix4.inverse(this.cameraMatrix,{});
        this.ProjectionviewMatrix = Cesium.Matrix4.multiply(this.projectionMatrix, this.viewMatrix, {});

        this._renewTransform = false;
    }
    updateAxis(){
        //axis 갱신
        let up = new Cesium.Cartesian3(0, 0, 1);
        let target = new Cesium.Cartesian3(0, 0, 0);
        this.xAxis = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.position, target, {}), {});
        this.yAxis = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(up, this.xAxis, {}), {});
        this.zAxis = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(this.xAxis, this.yAxis, {}), {});
    }

    lookAt(target, up) {
        if(!up){
            up = new Cesium.Cartesian3(0, 1, 0);
        }

        //계산에 기반이 되는 변수 설정
        let vXAxis = Object.assign({}, this.xAxis);
        let vTargetFromPosition = Cesium.Cartesian3.subtract(this.position, target, {});
        Cesium.Cartesian3.normalize(vTargetFromPosition, vTargetFromPosition);
        //계산된 각도에 방향을 부여하기 위해 법선벡터를 구한다
        let norVector = Cesium.Cartesian3.cross(vTargetFromPosition, vXAxis, {});
        
        if(Cesium.Cartesian3.magnitude(norVector) == 0){
            norVector = Object.assign({}, this.zAxis);
        }
        
        //계산시작
        let angleDir = (Cesium.Cartesian3.dot(norVector, new Cesium.Cartesian3(0,0,1)) > 0) ? 1 : -1;
        let tmpradYaw = 0;
        if((vTargetFromPosition.x != 0 || vTargetFromPosition.y != 0) && (vXAxis.x != 0 || vXAxis.y != 0)){
            //delta 를 현재 yaw pitch roll에 더하는 로직
            let xyProjectVector1 = Cesium.Plane.projectPointOntoPlane(Cesium.Plane.ORIGIN_XY_PLANE, vTargetFromPosition,{});
            let xyProjectVector2 = Cesium.Plane.projectPointOntoPlane(Cesium.Plane.ORIGIN_XY_PLANE, vXAxis,{});
            tmpradYaw = Cesium.Cartesian3.angleBetween(xyProjectVector1, xyProjectVector2);
            tmpradYaw *= angleDir;
        }

        //norVector와 xAxis를 각 면에 projection해서 정확한 각도의 direction을 구한다
        angleDir = (Cesium.Cartesian3.dot(norVector, new Cesium.Cartesian3(0,1,0)) > 0) ? 1 : -1;
        let tmpradPitch = 0;
        if((vTargetFromPosition.x != 0 || vTargetFromPosition.z != 0) && (vXAxis.x != 0 || vXAxis.z != 0)){
            let zxProjectVector1 = Cesium.Plane.projectPointOntoPlane(Cesium.Plane.ORIGIN_ZX_PLANE, vTargetFromPosition,{});
            let zxProjectVector2 = Cesium.Plane.projectPointOntoPlane(Cesium.Plane.ORIGIN_ZX_PLANE, vXAxis,{});
            tmpradPitch = Cesium.Cartesian3.angleBetween(zxProjectVector1, zxProjectVector2);
            tmpradPitch *= angleDir;
        }


        //norVector와 zAxis를 각 면에 projection해서 정확한 각도의 direction을 구한다
        angleDir = (Cesium.Cartesian3.dot(norVector, new Cesium.Cartesian3(1,0,0)) > 0) ? -1 : 1;
        let tmpradRoll = 0;
        if((vTargetFromPosition.y != 0 || vTargetFromPosition.z != 0) && (vXAxis.y != 0 || vXAxis.z != 0)){
            let yzProjectVector1 = Cesium.Plane.projectPointOntoPlane(Cesium.Plane.ORIGIN_YZ_PLANE, vTargetFromPosition,{});
            let yzProjectVector2 = Cesium.Plane.projectPointOntoPlane(Cesium.Plane.ORIGIN_YZ_PLANE, vXAxis,{});
            tmpradRoll = Cesium.Cartesian3.angleBetween(yzProjectVector1, yzProjectVector2);
            tmpradRoll *= angleDir;
        }

        //각도 반영
        this.rotation.lookAtCenterFromCartesian3(this.position.x, this.position.y, this.position.z, -Math.PI / 2);
        
        //기존 회전 mat3
        let originTrans = Cesium.Matrix4.getTranslation(this.cameraMatrix, {});
        let originScale = Cesium.Matrix4.getScale(this.cameraMatrix, {});

        //axis 갱신
        this.xAxis = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.position, target, {}), {});

        //y축 갱신
        //xAxis가 back vector를 기준으로 왼쪽 아니면 오른쪽에 있는지 판별 후 방향에 따라 +up, -up을 외적한다.
        let xAxisDir = (Cesium.Cartesian3.dot(this.xAxis, new Cesium.Cartesian3(1,0,0)) > 0) ? 1 : -1;
        Cesium.Cartesian3.multiplyByScalar(up, xAxisDir, up);
        this.yAxis = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(up, this.xAxis, {}), {});
        this.zAxis = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(this.xAxis, this.yAxis, {}), {});
        let ellipsoid = new Cesium.Ellipsoid(100, 100, 100);
        this._renewTransform = true;
      }
    setYawPitchRoll(Yaw, Pitch, Roll){
        this.rotation._yaw = Yaw;
        this.rotation._pitch = -Pitch;
        this.rotation._roll = commonUtil.degToRad(0);
        return this.rotation.getRotationMatirx();
    }

    addYawPitchRoll(Yaw, Pitch, Roll){
        //현재 yaw pitch roll 에 더한다음 갱신
        this.rotation._yaw += Yaw;
        this.rotation._pitch += Pitch;
        this.rotation._roll = commonUtil.degToRad(0);

        //현재 rotation matrix를 만들어 반환한다
        let curRotX = Cesium.Matrix3.fromRotationX(this.rotation._yaw, {});
        let curRotY = Cesium.Matrix3.fromRotationY(this.rotation._pitch, {});
        let curRot = Cesium.Matrix3.multiply(curRotY, curRotX, {});
        return this.rotation.getRotationMatirx();
    }

    getPosition(){
        return Cesium.Matrix4.getTranslation(this.cameraMatrix, {});
    }

    computeTranslationRotationCamaraMatirx(){
        let translation = Cesium.Matrix4.fromTranslation(this.position);
        //TRS Matrix생성
        let rotation = Cesium.Matrix4.fromTranslationQuaternionRotationScale(new Cesium.Cartesian3(0, 0, 0), this.rotation.getQuaternion(), new Cesium.Cartesian3(1, 1, 1));
        let rollMatrix = Cesium.Matrix3.fromRotationZ(commonUtil.degToRad(90));
        if(this.position.x < 0){
            rollMatrix = Cesium.Matrix3.fromRotationZ(commonUtil.degToRad(-90));
        }
        Cesium.Matrix4.multiplyByMatrix3(rotation, rollMatrix, rotation);
        console.log(this.position);
        return Cesium.Matrix4.multiply(translation, rotation, {});
    }
}

module.exports = CameraClass;