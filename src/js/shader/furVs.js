let furVs =
"attribute vec4 aVertexPosition;\n"+
"uniform mat4 u_matrix;\n"+ 

"uniform vec4 u_P;\n"+
"//uniform float u_Cd;\n"+
"uniform float u_numOfFurVertices;\n" +
"uniform vec4 u_cameraPosition;\n" +
"uniform float u_radius;\n" +

"varying float coeff;\n" +
"varying float numOfVertices;\n" +
"varying float distVertexFromCamera;\n" +
"varying float c_distance;\n" +
"varying float r;\n" +

"void main() {\n" + 
    "vec4 origin = vec4(0, 0, 0, 0);\n" +
    "vec4 tmpPosition = aVertexPosition;\n" +
    "float Cd;\n"+
    "Cd = distance(aVertexPosition, origin);\n" +
    "float length = Cd;\n" +

    "float Cd2 = (1.0 - aVertexPosition.z)/2.0;\n" +
    "if(Cd <= 1.0) Cd = 0.0;\n" +
    "Cd *= Cd;\n" +
    "Cd /= 10.0;\n" +
    "tmpPosition.z += u_P.z * Cd * Cd2;\n" +
    "// Multiply the position by the matrix\n" +
    "vec4 position = u_matrix * tmpPosition;\n" +

    "coeff = (length - 1.0) / u_numOfFurVertices;\n" +
    "numOfVertices = u_numOfFurVertices;\n" +
    "distVertexFromCamera = distance(position, u_cameraPosition);\n" +
    "c_distance = distance(vec4(0, 0, 0, 0), u_cameraPosition);\n" +
    "r = u_radius;\n" +
    "gl_Position = position;\n" + 
"}";

module.exports = furVs;