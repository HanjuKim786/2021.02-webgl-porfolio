let pointVs =
"attribute vec4 aVertexPosition;\n"+
"uniform mat4 u_matrix;\n"+ 

"void main() {\n" + 
    "// Multiply the position by the matrix\n"+
    "vec4 position = u_matrix * aVertexPosition;\n"+

    "gl_PointSize = 12.0;\n" +
    "gl_Position = position;\n" + 
"}";

module.exports = pointVs;