let furFs = 
"precision mediump float;\n"+

"uniform vec4 u_normal;\n"+
"uniform vec4 u_surfaceToLight;\n"+

"varying float numOfVertices;\n" +
"varying float coeff;\n" +
"varying float distVertexFromCamera;\n" +
"varying float c_distance;\n" +
"varying float r;\n" +
"float offset = 100.0;\n" +

"void main() {\n"+
    "float depth = gl_FragCoord.z;\n" +
    "float weight = depth * 0.7;\n" +
    "float light = dot(u_normal, u_surfaceToLight);\n" +
    "//light = light;\n" +
    "//vec4 mixColor = vec4(light, light, light, 1.0);\n" +

    "gl_FragColor = vec4(0.0, 0.4 * light, 0.0, 1.0 - coeff);\n"+
    "//gl_FragColor = vec4(light, light, light, 1.0);\n" +
    "//gl_FragColor = vec4(weight, weight, weight, 1.0);\n"+
    "float max_distance = c_distance * c_distance + r * r;\n" +
    "max_distance = sqrt(max_distance);\n" +
    "if(distVertexFromCamera > max_distance - offset) gl_FragColor = vec4(0.0, 0.4, 0.0, 0.3);\n" +
"}";

module.exports = furFs;