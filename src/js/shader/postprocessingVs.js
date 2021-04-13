let postProcessingVs =
"attribute vec4 aVertexPosition;\n" +
"attribute vec2 a_texcoord;\n" +
"varying vec2 v_texcoord;\n" +
"uniform mat4 u_matrix;\n" +
"void main() {\n" + 
    "gl_Position = u_matrix * aVertexPosition;\n"+
    "v_texcoord = a_texcoord;\n" +
"}";

module.exports = postProcessingVs;