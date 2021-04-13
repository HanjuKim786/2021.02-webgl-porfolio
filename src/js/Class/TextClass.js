const ObjectClass = require('./ObjectClass');
const TransformClass = require('./TransformClass');
const CircleColliderClass = require('./CircleColliderClass');
const textVs = require('../shader/textVs');
const textFs = require('../shader/textFs');

class TextClass extends ObjectClass{
    constructor(_gl, _camera){
        super(_gl, _camera);

        this.vertexShaderSource = textVs;
        this.fragmentShaderSource = textFs;

        this.type = "text";
        this.text = "click";

        this.matrixLocation = null;

        this.transforms = [];

        this.vertices = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        this.texcoords = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
    }

    init(){
        this.setupShaders();
        this.setupBuffers(this.vertices);
    }

    setupBuffers(vertices){
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.texcoords), this.gl.STATIC_DRAW);
        
        this.vertexBuffer.itemSize = 2;
        this.vertexBuffer.numberOfItems = parseInt(vertices.length / 2);
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

        let s = new XMLSerializer().serializeToString(document.getElementsByTagName("template")[0].content);
        let encodedData = window.btoa(s);

        let tex = this.gl.createTexture();
        
        let image = new Image();
        image.src = "data:image/svg+xml;base64, " + encodedData;
        let self = this;
        image.onload = function(){
            self.gl.activeTexture(self.gl.TEXTURE5);
            self.gl.bindTexture(self.gl.TEXTURE_2D, tex);
            self.gl.texImage2D(self.gl.TEXTURE_2D, 0, self.gl.RGBA, self.gl.RGBA, self.gl.UNSIGNED_BYTE, image);
            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_WRAP_S, self.gl.CLAMP_TO_EDGE);
            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_WRAP_T, self.gl.CLAMP_TO_EDGE);
            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_MIN_FILTER, self.gl.LINEAR);
        }

        

        //Get location in shaderprogram
        this.matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "u_matrix");
        this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        this.textureLocation = this.gl.getUniformLocation(this.shaderProgram, "u_texture");
        this.texcoordLocation = this.gl.getAttribLocation(this.shaderProgram, "a_texcoord");

        //Set Vertices
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.enableVertexAttribArray(this.texcoordLocation);
        this.gl.vertexAttribPointer(this.texcoordLocation, 2, this.gl.FLOAT, false, 0, 0);

        //transforms 를 순회하며 모두 draw한다
        for(let i = 0; i < this.transforms.length; i++){
            let matrix = this.transforms[i].getTransform();
            matrix = Cesium.Matrix4.multiply(this.camera.ProjectionviewMatrix, matrix, {});
            this.gl.uniformMatrix4fv(this.matrixLocation, false, this.matrix4ToArrayRowMajor(matrix));
            this.gl.uniform1i(this.textureLocation, 5);
        
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }
    }

    addTransform(t){
        this.transforms.push(t);
    }
}

module.exports = TextClass;