let backgroundFs =
"precision mediump float;\n"+
"varying vec2 v_texcoord;\n"+
"uniform sampler2D u_texture;\n"+
"uniform float aspect;\n" +
"void main() {\n" +
    "gl_FragColor = texture2D(u_texture, v_texcoord);\n"+
"}";

module.exports = backgroundFs;