let postprocessingFs =
"precision mediump float;\n"+
"varying vec2 v_texcoord;\n"+
"uniform sampler2D u_texture;\n"+
"uniform sampler2D u_depthTexture;\n"+
"uniform float u_aspect;\n" +
"void main() {\n" +
    "vec4 depth = texture2D(u_depthTexture, vec2((v_texcoord.x / 2.0), v_texcoord.y / 2.0));\n" +
    "float color = (depth.r * depth.r * depth.r) * 50.0;\n" +
    "float factor = 3.0;\n" +
    "//gl_FragColor = mix(texture2D(u_texture, v_texcoord), depth, 0.5);\n"+
    "if(color > 0.5) {color = 1.0; factor = 1.0;}\n" +
    "gl_FragColor = texture2D(u_texture, v_texcoord) * color * factor;\n"+
    "//gl_FragColor = vec4(color, color, color, 1.0);\n"+
"}";

module.exports = postprocessingFs;