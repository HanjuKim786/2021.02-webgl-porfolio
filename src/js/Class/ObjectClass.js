const defaultVs = require('../shader/defaultVs');
const defaultFs = require('../shader/defaultFs');

class ObjectClass {
    constructor(_gl, _camera)
    {
        this.gl = _gl;
        this.camera = _camera;
        this.shaderProgram = null;
        this.vertexBuffer = null;
        this.indexBuffer = null;

        this.vertexShaderSource = defaultVs;
        this.fragmentShaderSource = defaultFs;

        this.type = "default";
        this.collider = null;
        
        //ex data
        this.vertices = [
            0.0, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0
        ];
        this.indices = [];
    }

    init(){
        this.setupShaders();
        this.setupBuffers(this.vertices);
    }

    update(){

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

    setupShaders(){
        let vertexShader = this.loadShader(this.gl.VERTEX_SHADER, this.vertexShaderSource);
        let fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, this.fragmentShaderSource);

        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        
        if(!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            alert("Failed to setup shaders");
        }
        

        this.gl.useProgram(this.shaderProgram);
        
    }

    setupBuffers(vertices){
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);

        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numberOfItems = parseInt(vertices.length / 3);
    }

    render(){
        //Set shader
        this.gl.linkProgram(this.shaderProgram);
        if(!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            alert("Failed to setup shaders");
        }
        this.gl.useProgram(this.shaderProgram);

        //Get location in shaderprogram
        this.fudgeLocation = this.gl.getUniformLocation(this.shaderProgram, "u_fudgeFactor");;
        this.matrixLocation = this.gl.getUniformLocation(this.shaderProgram, "u_matrix");
        this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");

        //Set vertices
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

        //Camera
        //this.fudgeFactor += 1.0;
        //this.gl.uniform1f(this.fudgeLocation, this.fudgeFactor);
        this.gl.uniformMatrix4fv(this.matrixLocation, false, this.matrix4ToArrayColumnMajor(this.transform));

        //Draw
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexBuffer.numberOfItems);
    }
}

module.exports = ObjectClass;