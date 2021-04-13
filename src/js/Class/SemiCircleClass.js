const ObjectClass = require('./ObjectClass');
const TransformClass = require('./TransformClass');
const CircleColliderClass = require('./CircleColliderClass');
const perspectiveVs = require('../shader/perspectiveVs');
const defaultFs = require('../shader/defaultFs');

class SemiCircleClass extends ObjectClass{
    constructor(_gl, _camera){
        super(_gl, _camera);

        this.vertexShaderSource = perspectiveVs;
        this.fragmentShaderSource = defaultFs;

        this.type = "semicircle";

        this.matrixLocation = null;

        this.transforms = [];

        this.vertices = [
            0.0, 0.0, 0.0,
            0.0, 0.0, -1.0,
            0.0, -0.75, -0.75,
            0.0, -1.0, 0.0,
            0.0, -0.75, 0.75,
            0.0, 0.0, 1.0,
        ];
    }

    init(){
        this.setupShaders();
        this.setupBuffers(this.vertices);
    }

    update(){

    }

    render(){
        if(this.transforms.length == 0){
            return;
        }

        //Set Shader
        this.setupShaders();
        this.setupBuffers(this.vertices);
        
        this.gl.disable(this.gl.CULL_FACE);
        
        //Get location in shaderprogram
        this.matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "u_matrix");
        this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");

        //Set Vertices
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

        //transforms 를 순회하며 모두 draw한다
        for(let i = 0; i < this.transforms.length; i++){
            let matrix = this.transforms[i].getTransform();
            matrix = Cesium.Matrix4.multiply(this.camera.ProjectionviewMatrix, matrix, {});
            this.gl.uniformMatrix4fv(this.matrixLocation, false, this.matrix4ToArrayRowMajor(matrix));
        
            this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.vertexBuffer.numberOfItems);
        }
    }

    addTransform(t){
        this.transforms.push(t);
    }
}

module.exports = SemiCircleClass;