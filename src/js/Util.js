const { Cesium3DTile } = require("cesium");

var commonUtil = {
    radToDeg: function(r) {
        return r * 180 / Math.PI;
    },
    degToRad: function(d) {
        return d * Math.PI / 180;
    },
    perspective: function(fieldOfViewInRadians, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);
    
       return new Cesium.Matrix4(f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * rangeInv, -1, 0, 0, near * far * rangeInv * 2, 0);
    },
}

module.exports = commonUtil;