const CameraClass = require('./CameraClass');
const EventClass = require('./EventClass');
const CircleClass = require('./CircleClass');
const CircleFurClass = require('./CircleFurClass');
const SemiCircleClass = require('./SemiCircleClass');
const LineClass = require('./LineClass');
const PointClass = require('./PointClass');
const TextClass = require('./TextClass');

const RotationClass = require('./RotationClass');
const TransformClass = require('./TransformClass');
const commonUtil = require('../Util');

const RayClass = require('./RayClass');

const ColliderManager = require('./ColliderManager');
const CircleColliderClass = require('./CircleColliderClass');
const PointColliderClass = require('./PointColliderClass');

const backgroundVs = require('../shader/backgroundVs');
const backgroundFs = require('../shader/backgroundFs');
const postprocessingVs = require('../shader/postprocessingVs');
const postprocessingFs = require('../shader/postprocessingFs');

const backgroundImg = require('../../img/background.png');

global.__RADIUS = 500.0;

class SceneClass{
    constructor(_gl){
        this.objectClasses = [];
        this.eventManager = new EventClass();
        this.camera = new CameraClass(_gl, this);
        this.gl = _gl;

        //scene에서 마우스가 클릭이 되었는가?
        this.isClicked = false;

        //scene에서 entry point가 클릭이 되었는가?
        this.isClickedEntryPoint = false;
        //scene에서 zoom in 효과가 종료되었는가?
        this.endZoomIn = false;
        //얼마나 zoom in 을 할 것인가?
        this.zoomInCount = 1900.0;
        //자동으로 camera를 회전시킬것인가?
        this.autoRotate = false;
        //camera를 마우스에의한 회전을 막을것인가?
        this.cameraRotationLock = true;

        //scene에서 사용할 Object Class load 하기
        this.objectClasses.push(new CircleClass(this.gl, this.camera));
        this.objectClasses.push(new CircleFurClass(this.gl, this.camera));
        this.objectClasses.push(new SemiCircleClass(this.gl, this.camera));
        this.objectClasses.push(new LineClass(this.gl, this.camera));
        this.objectClasses.push(new PointClass(this.gl, this.camera));
        this.objectClasses.push(new TextClass(this.gl, this.camera));

        //camera 생성 후 ray 생성 필요
        this.ray = new RayClass(this.gl, this);

        this.colliderManager = new ColliderManager();

        //depth texture
        //set unused depthtexture to default framebuffer
        
        /////////////////////////////////////////////////////////////////////////////////////////////////
        //set depthTexture
        this.depthTexture = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE3);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT, parseInt(this.gl.canvas.clientWidth/2), parseInt(this.gl.canvas.clientHeight/2), 0, this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_INT, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        
        //depthFramebuffer
        this.depthFramebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthFramebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture, 0);


        //color texture
        this.colorTexture = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE4);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorTexture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            parseInt(this.gl.canvas.clientWidth/2),
            parseInt(this.gl.canvas.clientHeight/2),
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            null,
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            this.colorTexture,
            0);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        //게임 오브젝트 로드
        this._loadObject();

        let self = this;
        //UI Event 처리
        this.gl.canvas.addEventListener("click", (e)=>{
            let x = e.clientX;
            let y = e.clientY;

            let width = self.gl.canvas.clientWidth;
            let height = self.gl.canvas.clientHeight;
        });
        this.gl.canvas.addEventListener("mousedown", (e)=>{
            self.isClicked = true;
            self.autoRotate = false;

            this.eventManager.fire("mousedown", e);
        });
        this.gl.canvas.addEventListener("mouseup", (e)=>{
            this.eventManager.fire("mouseup", e);

            if(self.isClicked){
                let ray = self.ray.rayFromWindow(e.clientX, e.clientY);
            
                for(let x = 0; x < self.camera.zFar / 2; x += 0.5){
                    let step = Cesium.Cartesian3.multiplyByScalar(ray, x, {});
                    let p = Cesium.Cartesian3.add(this.camera.position, step, {});
                    let o = self.colliderManager.isCollided(p);
                    if(o){
                        if(o.type == "point"){
                            this.isClickedEntryPoint = true;
                            this.autoRotate = true;
                            o.transforms = [];
                            break;
                        }
                        if(!window.isLoading){ 
                            $('#vertexInfoBox').modal({
                                show:true,
                                backdrop:false,
                            });
                            $("#vertexInfoBox").css("height","0px");
                            $("#vertexInfoBox").css("top","300px");
                            $("#vertexInfoBox").animate({
                                height: "100%",
                                top : "0px",
                              },500);
                            window.itemListInit('1', null);
                        }
                        break;
                    }
                }

                self.isClicked = false;
            }
        });
        this.gl.canvas.addEventListener("mousemove", (e)=>{
            if(!this.cameraRotationLock){
                this.eventManager.fire("mousemove", e);    
            }
            self.isClicked = false;
        });
        this.gl.canvas.addEventListener("mousewheel", (e)=>{
            this.eventManager.fire("mousewheel", e);
            e.preventDefault();
        });
    }

    addObject(type, transform){
        for(let i = 0; i < this.objectClasses.length; i++){
            if(this.objectClasses[i].type == type){
                this.objectClasses[i].addTransform(transform);
                return true;
            }
        }
        return false;
    }

    init(){
        for(let i = 0; i < this.objectClasses.length; i++){
            this.objectClasses[i].init();
            return true;
        }
    }

    update(){
        this.camera.update();
        for(let i = 0; i < this.objectClasses.length; i++){
            this.objectClasses[i].update();
        }

        if(this.isClickedEntryPoint){
            if(!this.endZoomIn){
                this.zoomIn();
            }
        }

        if(this.autoRotate){
            this.camera.moveZAxis(2.0);
            this.camera.lookAt(new Cesium.Cartesian3(0,0,0));
        }
    }

    render(){
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.depthFramebuffer);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.depthRange(0.0, 0.2);
        this.gl.enable(this.gl.DEPTH_TEST);
        //depth texture 만들기 위해 render 돌리기
        for(let i = 0; i < this.objectClasses.length; i++){
            this.objectClasses[i].render();
        }
        //depth texture를 바탕으로 메인 framebuffer에 render 걸기
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        for(let i = 0; i < this.objectClasses.length; i++){
            this.objectClasses[i].render();
        }

        this.postprocessing();
        let pixels = new Uint8Array(4 * parseInt(this.gl.canvas.clientWidth/4) * parseInt(this.gl.canvas.clientHeight/4));
        this.gl.readPixels(0, 0, parseInt(this.gl.canvas.clientWidth/4), parseInt(this.gl.canvas.clientHeight/4), this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
        this.drawBackground(backgroundImg, 256, 256);
    }
    postprocessing(){
        let width = this.gl.canvas.clientWidth/4;
        width = parseInt(width);
        let height = this.gl.canvas.clientHeight/4;
        height = parseInt(height);
        let pixels = new Uint8Array(4 * width * height);
        let depthPixels = new Uint8Array(4 * 512 * 512);
        
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        //post processing business logic
        this.gl.readPixels(0, 0, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

        //processing 1

        for(let i = 0; i < pixels.length; i= i + 4){
            //evaluate brighteness formula : 0.299 R + 0.587 G + 0.114 B
            let brighteness = 0.299 * pixels[i] + 0.587 * pixels[i+1] + 0.114 * pixels[i+2];
            let weight = 0.4;
            
            if(brighteness > 255/2){
                //R
                pixels[i] = pixels[i] + pixels[i] * weight;
                pixels[i] = parseInt(pixels[i]);
                if(pixels[i] > 255 || pixels[i+3]/255 > 0.31){
                    pixels[i] = 255;
                }
                //G
                pixels[i+1] = pixels[i+1] + pixels[i+1] * weight;
                pixels[i+1] = parseInt(pixels[i+1]);
                if(pixels[i+1] > 255 || pixels[i+3]/255 > 0.31){
                    pixels[i+1] = 255;
                }
                //B
                pixels[i+2] = pixels[i+2] + pixels[i+2] * weight;
                pixels[i+2] = parseInt(pixels[i+2]);
                if(pixels[i+2] > 255 || pixels[i+3]/255 > 0.31){
                    pixels[i+2] = 255;
                }
            }else{
                //R
                pixels[i] = pixels[i] - pixels[i] * weight;
                pixels[i] = parseInt(pixels[i]);
                if(pixels[i] < 0){
                    pixels[i] = 0;
                }
                //G
                pixels[i+1] = pixels[i+1] - pixels[i+1] * weight;
                pixels[i+1] = parseInt(pixels[i+1]);
                if(pixels[i+1] < 0){
                    pixels[i+1] = 0;
                }
                //R
                pixels[i+2] = pixels[i+2] - pixels[i+2] * weight;
                pixels[i+2] = parseInt(pixels[i+2]);
                if(pixels[i+2] < 0){
                    pixels[i+2] = 0;
                }
                //A
                pixels[i+3] = pixels[i+3] - pixels[i+3] * weight;
                pixels[i+3] = parseInt(pixels[i+3]);
                if(pixels[i+3] < 0){
                    pixels[i+3] = 0;
                }
            }
        }
        

        //processing 2
        for(let i = 0; i < pixels.length; i= i + 4){
            let brighteness = 0.299 * pixels[i] + 0.587 * pixels[i+1] + 0.114 * pixels[i+2];
            let weight = Math.abs(pixels[i+1] - 255) * 0.01;
            
            if(pixels[i+1]>0 && pixels[i+1] < 255/2){
                //R
                pixels[i] /= weight;
                pixels[i] = parseInt(pixels[i]);
                if(pixels[i] < 0){
                    pixels[i] = 0;
                }
                //G
                pixels[i+1] /= weight;
                pixels[i+1] = parseInt(pixels[i+1]);
                if(pixels[i+1] < 0){
                    pixels[i+1] = 0;
                }
                //R
                pixels[i+2] /= weight;
                pixels[i+2] = parseInt(pixels[i+2]);
                if(pixels[i+2] < 0){
                    pixels[i+2] = 0;
                }
            }
        }
        
        
        
        
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        let vertexShader = this.loadShader(this.gl.VERTEX_SHADER, postprocessingVs);
        let fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, postprocessingFs);

        let program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        // lookup uniforms
        let verticesLocation = this.gl.getAttribLocation(program, "aVertexPosition");
        let matrixLocation = this.gl.getUniformLocation(program, "u_matrix");
        let textureLocation = this.gl.getUniformLocation(program, "u_texture");
        let texcoordLocation = this.gl.getAttribLocation(program, "a_texcoord");
        let cameraAspectLocation = this.gl.getUniformLocation(program, "u_aspect");

        //test
        let depthTextureLocation = this.gl.getUniformLocation(program, "u_depthTexture");;

        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            alert("Failed to setup shaders");
        }
        this.gl.useProgram(program);

        // Create a buffer.
        let verticesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, verticesBuffer);
        // Put a unit quad in the buffer
        let vertices = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        
        // Create a buffer for texture coords
        let texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer);

        

        // Put texcoords in the buffer
        let texcoords = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.STATIC_DRAW);
        
        let tex = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        let clampedarray = new Uint8ClampedArray(pixels);
        let image = new ImageData(clampedarray, width, height);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

        // Setup the attributes to pull data from our buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, verticesBuffer);
        this.gl.enableVertexAttribArray(verticesLocation);
        this.gl.vertexAttribPointer(verticesLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer);
        this.gl.enableVertexAttribArray(texcoordLocation);
        this.gl.vertexAttribPointer(texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        // this matrix will convert from pixels to clip space
        let matrix = Cesium.Matrix4.fromTranslationRotationScale(new Cesium.TranslationRotationScale(new Cesium.Cartesian3(-1, -1, 0), Cesium.Quaternion.IDENTITY, new Cesium.Cartesian3(1 * this.camera.aspect, 2, 0)), {});
        
        // Set the matrix.
        this.gl.uniformMatrix4fv(matrixLocation, false, this.matrix4ToArrayRowMajor(matrix));
        this.gl.uniform1f(cameraAspectLocation, this.camera.aspect);
        this.gl.uniform1i(textureLocation, 0);

        //test
        this.gl.uniform1i(depthTextureLocation, 3);

        // draw the quad (2 triangles, 6 vertices)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    _loadObject(){
        //test line object
        let trf = new TransformClass();
        this.addObject("line", trf);

        let height = 100;

        let numOfCol = 4;
        let numOfRow = 9;

        let stepCol = commonUtil.degToRad(60/numOfCol);
        let stepRow = commonUtil.degToRad(60/numOfRow);

        let ellipsoid = new Cesium.Ellipsoid(global.__RADIUS, global.__RADIUS, global.__RADIUS);

        //create point
        {
            let pointPosition = new Cesium.Cartesian3(2780, 0, 0);
            let rot = new RotationClass(0,0,0);
            let objInfo = new TransformClass(pointPosition, rot, new Cesium.Cartesian3(1,1,1));
            this.addObject("point", objInfo);
            this.colliderManager.addCollider(new PointColliderClass(this.objectClasses[4], this.objectClasses[4].transforms.length, pointPosition, 25));
        }
        //create text
        {
            let textPosition = new Cesium.Cartesian3(2790, -1, 1);
            let rot = new RotationClass(0,Math.PI/2,0);
            let objInfo = new TransformClass(textPosition, rot, new Cesium.Cartesian3(3,6,1));
            this.addObject("text", objInfo);
        }
        
        
        //let rot = new RotationClass(0,0,0, ellipsoid);
        //test
        //lat 위도, lng 경도
        for(let lat = commonUtil.degToRad(30); lat > -commonUtil.degToRad(30); lat -= stepCol){
            for(let lng = 0; lng < commonUtil.degToRad(180); lng += stepRow){
                let CesiumPosition = Cesium.Cartographic.toCartesian(Cesium.Cartographic.fromRadians(lng , lat), ellipsoid);
                let position = new Cesium.Cartesian3(CesiumPosition.x, CesiumPosition.y, CesiumPosition.z)
                let rot = new RotationClass(0,0,0);
                rot._pitch = 0;
                rot._yaw = 0;
                rot._roll = Math.PI/2;
                let semecirclePosition = new Cesium.Cartesian3(position.x, position.y, position.z);
                let objInfo = new TransformClass(semecirclePosition, rot, new Cesium.Cartesian3(20,20,20));
                this.addObject("semicircle", objInfo);
                rot = new RotationClass(0,0,0);
                rot._pitch = 0;
                rot._yaw = Math.PI/2;
                rot._roll = Math.PI/2;
                objInfo = new TransformClass(semecirclePosition, rot, new Cesium.Cartesian3(20,20,20));
                this.addObject("semicircle", objInfo);

                this.colliderManager.addCollider(new CircleColliderClass(this.objectClasses[2], this.objectClasses[2].transforms.length-1, semecirclePosition, 20));

                rot = new RotationClass(0,0,0);
                rot.fromlnglat(lng , lat);
                rot._pitch = 0;
                rot._yaw = 0;
                rot._roll = Math.PI/2;
                objInfo = new TransformClass(position, rot, new Cesium.Cartesian3(15,15,15));
                this.addObject("circlefur", objInfo);
                rot = new RotationClass(0,0,0);
                rot.fromlnglat(lng , lat);
                rot._pitch = 0;
                rot._yaw = Math.PI/2;
                rot._roll = Math.PI/2;
                objInfo = new TransformClass(position, rot, new Cesium.Cartesian3(15,15,15));
                this.addObject("circlefur", objInfo);
            }
        }
    }
    drawBackground(texture, width, height){
        let vertexShader = this.loadShader(this.gl.VERTEX_SHADER, backgroundVs);
        let fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, backgroundFs);

        let program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        // lookup uniforms
        let verticesLocation = this.gl.getAttribLocation(program, "aVertexPosition");
        let matrixLocation = this.gl.getUniformLocation(program, "u_matrix");
        let textureLocation = this.gl.getUniformLocation(program, "u_texture");
        let texcoordLocation = this.gl.getAttribLocation(program, "a_texcoord");

        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            alert("Failed to setup shaders");
        }
        this.gl.useProgram(program);

        // Create a buffer.
        let verticesBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, verticesBuffer);
        // Put a unit quad in the buffer
        let vertices = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        
        // Create a buffer for texture coords
        let texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer);

        

        // Put texcoords in the buffer
        let texcoords = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texcoords), this.gl.STATIC_DRAW);

        let img = new Image();
        let self = this;
        img.onload = function(){
            let tex = self.gl.createTexture();
            self.gl.activeTexture(self.gl.TEXTURE1);
            self.gl.bindTexture(self.gl.TEXTURE_2D, tex);
            self.gl.texImage2D(self.gl.TEXTURE_2D, 0, self.gl.RGBA, self.gl.RGBA, self.gl.UNSIGNED_BYTE, img);

            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_WRAP_S, self.gl.CLAMP_TO_EDGE);
            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_WRAP_T, self.gl.CLAMP_TO_EDGE);
            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_MIN_FILTER, self.gl.LINEAR);
        }
        img.src = backgroundImg.default;

        // Setup the attributes to pull data from our buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, verticesBuffer);
        this.gl.enableVertexAttribArray(verticesLocation);
        this.gl.vertexAttribPointer(verticesLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer);
        this.gl.enableVertexAttribArray(texcoordLocation);
        this.gl.vertexAttribPointer(texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);
        let matrix = Cesium.Matrix4.fromTranslationRotationScale(new Cesium.TranslationRotationScale(new Cesium.Cartesian3(-1, -1, 0), Cesium.Quaternion.IDENTITY, new Cesium.Cartesian3(2, 2, 0)), {});
        
        // Set the matrix.
        this.gl.uniformMatrix4fv(matrixLocation, false, this.matrix4ToArrayRowMajor(matrix));

        self.gl.uniform1i(textureLocation, 1);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // draw the quad (2 triangles, 6 vertices)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
    loadShader(type, shaderSource) {
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, shaderSource);
        this.gl.compileShader(shader);

        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert("Error comppiling shader" + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
    
    zoomIn(){
        if(this.zoomInCount >= 0.0){
            this.camera.moveXAxis(-150.0);
            this.zoomInCount -= 150.0;
            console.log(this.zoomInCount);
        }
        else{
            this.endZoomIn = true;
            this.cameraRotationLock = false;
        }
    }

    matrix4ToArrayRowMajor(matrix4){
        let arr = [];
        let tmp = Cesium.Matrix4.toArray(matrix4);
        for(let i = 0; i < 16; i++){
                arr.push(tmp[i]);
        }

        return arr;
    }
}

module.exports = SceneClass;