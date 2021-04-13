let defaultVs =
"attribute vec3 aVertexPosition;\n"+ 
"void main() {\n" + 
    "gl_Position = vec4(aVertexPosition, 1.0);\n"+
"}";

module.exports = defaultVs;