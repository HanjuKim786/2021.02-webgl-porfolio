const ObjectClass = require('./ObjectClass');
const TransformClass = require('./TransformClass');
const furVs = require('../shader/furVs');
const furFs = require('../shader/furFs');

class CircleFurClass extends ObjectClass{
    constructor(_gl, _camera){
        super(_gl, _camera);

        this.vertexShaderSource = furVs;
        this.fragmentShaderSource = furFs;

        this.type = "circlefur";

        this.matrixLocation = null;

        this.transforms = [];

        //한 선당 Fur의 밀도
        //9개의 선으로 이루어진 원
        //->desityOfFur * 9 = numOfFur
        this.densityOfFur = 3;
        //Fur의 길이
        this.lengthOfFur = 5;
        //Fur를 이루는 vertex의 개수
        this.numOfFurVectices = 10.0;
        //바람 압력
        this.windPressure = new Cesium.Cartesian3(0, 0, 0.5);
        //바람 방향
        this.windDir = 1;

        //퍼를 이루게될 면들, 여기서는 원을 기준으로 삼음
        this.vertices = [
            0.0, 0.0, 0.0,
            0.0, 0.0, 1.0,
            0.0, 0.75, 0.75,
            0.0, 1.0, 0.0,
            0.0, 0.75, -0.75,
            0.0, 0.0, -1.0,
            0.0, -0.75, -0.75,
            0.0, -1.0, 0.0,
            0.0, -0.75, 0.75,
            0.0, 0.0, 1.0,
        ];
        this.furVertices = []
    }

    init(){
        this.setupShaders();
        this.setupBuffers(this.vertices);
    }

    setupBuffers(vertices, indices){
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numberOfItems = parseInt(vertices.length / 3);

        //index buffer setting
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        if(indices){
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        }
    }

    update(){
        //바람 압력 조정
        this.windPressure.z += this.windDir * 0.01;
        if(this.windPressure.z > 0.5 || this.windPressure.z < 0.1){
            this.windDir *= -1;
        }

        //Fur 생성
        this.furVertices = [];
        //원을 구성하는 각 면을 순회한다
        for(let i = 0 ; i < this.vertices.length/3; ++i){
            let curVector = new Cesium.Cartesian3(this.vertices[i*3+0], this.vertices[i*3+1], this.vertices[i*3+2]);
            let nextVector = new Cesium.Cartesian3(this.vertices[i*3+3], this.vertices[i*3+4], this.vertices[i*3+5]);
            let dirVector = Cesium.Cartesian3.subtract(nextVector, curVector, {});
            let divideFactor = Math.max(Math.abs(dirVector.x), Math.abs(dirVector.y), Math.abs(dirVector.z));
            Cesium.Cartesian3.divideByScalar(dirVector, divideFactor, dirVector);
            //Cesium.Cartesian3.normalize(dirVector, dirVector);

            let dist = Cesium.Cartesian3.distance(curVector, nextVector);
            let stride = dist / this.densityOfFur;
            
            //각 면을 density만큼 vertex를 만든다
            for(let j = 1; j < this.densityOfFur; j++){
                let origin = new Cesium.Cartesian3(curVector.x + dirVector.x * j * stride, curVector.y + dirVector.y * j * stride, curVector.z + dirVector.z * j * stride);
                let normal = Cesium.Cartesian3.subtract(origin, Cesium.Cartesian3.ZERO, {});

                Cesium.Cartesian3.negate(normal, normal);
                normal = new Cesium.Cartesian3(0, -1, 0);
                
                this.furVertices.push(origin.x);
                this.furVertices.push(origin.y);
                this.furVertices.push(origin.z);
                
                //만들어진 vertex를 기준으로 fur를 구성한다.
                for(let k = 1 * (this.lengthOfFur / this.numOfFurVectices); k < this.lengthOfFur; k += (this.lengthOfFur/this.numOfFurVectices)){
                    let tmp = Cesium.Cartesian3.add(origin, Cesium.Cartesian3.multiplyByScalar(normal, k, {}),{});
                    this.furVertices.push(tmp.x);
                    this.furVertices.push(tmp.y);
                    this.furVertices.push(tmp.z);
                }
            }
        }

        //index 생성
        this.indices = [];
        //원을 이루는 면의 수 * 한 면 당 퍼의 수 = 전체 퍼의 수
        let iMax = ((this.vertices.length/3)-1) * (this.densityOfFur - 2);
        //퍼 하나당 버텍스 수
        let jMax = this.numOfFurVectices;
        for(let i = 0 ; i < iMax; ++i){
            for(let j = 0; j < jMax - 1; j++){
                this.indices.push(i*jMax + j);this.indices.push(i*jMax + j + 1);
            }
        }
    }

    render(){
        if(this.transforms.length == 0){
            return;
        }

        //Set Shader
        this.setupShaders();
        //set buffer
        this.setupBuffers(this.furVertices, this.indices);
        
        this.gl.enable(this.gl.CULL_FACE);
        
        //Get location in shaderprogram
        this.matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "u_matrix");
        this.PLocation = this.gl.getUniformLocation(this.shaderProgram, "u_P");
        this.numOfFurVerticesLocation = this.gl.getUniformLocation(this.shaderProgram, "u_numOfFurVertices");
        this.cameraPositionLocation = this.gl.getUniformLocation(this.shaderProgram, "u_cameraPosition");
        this.radiusLocation = this.gl.getUniformLocation(this.shaderProgram, "u_radius");
        this.normalLocation = this.gl.getUniformLocation(this.shaderProgram, "u_normal");
        this.surfaceToLightLocation = this.gl.getUniformLocation(this.shaderProgram, "u_surfaceToLight");

        this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");

        //Set Vertices
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
        this.gl.lineWidth(1.0);

        //transforms 를 순회하며 모두 draw한다
        for(let i = 0; i < this.transforms.length; i++){
            let matrix = this.transforms[i].getTransform();
            matrix = Cesium.Matrix4.multiply(this.camera.ProjectionviewMatrix, matrix, {});
            this.gl.uniformMatrix4fv(this.matrixLocation, false, this.matrix4ToArrayRowMajor(matrix));
            this.gl.uniform4fv(this.PLocation, [this.windPressure.x, this.windPressure.y, this.windPressure.z, 0]);
            this.gl.uniform1f(this.numOfFurVerticesLocation, this.numOfFurVectices);
            let tmpCameraPosition = Cesium.Matrix4.getTranslation(this.camera.ProjectionviewMatrix, {});
            this.gl.uniform4fv(this.cameraPositionLocation, [tmpCameraPosition.x, tmpCameraPosition.y, tmpCameraPosition.z, 0]);
            this.gl.uniform1f(this.radiusLocation, global.__RADIUS);
        
            let normal = Cesium.Cartesian3.subtract(this.transforms[i]._translation, new Cesium.Cartesian3(0, 0, 0), {});
            normal = Cesium.Cartesian3.normalize(normal, {});
            let surfaceToLight = Cesium.Cartesian3.subtract(this.camera.position, this.transforms[i]._translation, {});
            surfaceToLight = Cesium.Cartesian3.normalize(surfaceToLight, {});
            this.gl.uniform4fv(this.normalLocation, [normal.x, normal.y, normal.z, 0]);
            this.gl.uniform4fv(this.surfaceToLightLocation, [surfaceToLight.x, surfaceToLight.y, surfaceToLight.z, 0]);    

            let primitiveType = this.gl.LINES;
            let offset = 0;
            //index의 개수
            //var count = 2 * (this.lengthOfFur-1) * ((this.vertices.length/3) - 1) * (this.densityOfFur - 2);
            let count = this.indices.length;
            let indexType = this.gl.UNSIGNED_SHORT;
            this.gl.drawElements(primitiveType, count, indexType, offset);

            //this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.vertexBuffer.numberOfItems);
            //this.gl.drawArrays(this.gl.LINES, 0, this.vertexBuffer.numberOfItems);
        }
    }

    addTransform(t){
        this.transforms.push(t);
    }
}

module.exports = CircleFurClass;