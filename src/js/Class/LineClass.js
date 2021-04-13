const ObjectClass = require('./ObjectClass');
const TransformClass = require('./TransformClass');
const perspectiveVs = require('../shader/perspectiveVs');
const lineFs = require('../shader/lineFs');

class LineClass extends ObjectClass{
    constructor(_gl, _camera){
        super(_gl, _camera);

        this.vertexShaderSource = perspectiveVs;
        this.fragmentShaderSource = lineFs;

        this.type = "line";

        this.matrixLocation = null;

        this.transforms = [];

        this.vertices = [];
    }

    init(){
        this.setupShaders();
        this.setupBuffers(this.vertices);
    }

    update(){

    }

    setVertices(vertexArr){
        this.vertices = vertexArr;
        console.log(this.vertices);
    }

    render(){
        if(this.transforms.length == 0){
            return;
        }

        //Set Shader
        this.setupShaders();
        this.setupBuffers(this.vertices);
        
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
        
            this.gl.drawArrays(this.gl.LINES, 0, 2);
        }
    }

    addTransform(t){
        this.transforms.push(t);
    }
}

module.exports = LineClass;