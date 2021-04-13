module.exports = function(sequelize, dataType){
    let appInfo = sequelize.define("appInfo", {
        id:{
            filed:"id",
            type: dataType.INTEGER,
            primaryKey: true, 
            autoIncrement: true,
            allowNull: false
        },
        category:{
            filed:"category",
            type: dataType.TEXT,
            allowNull: false
        },
        type:{
            filed: "type",
            type: dataType.TEXT,
            allowNull: true
        },
        date:{
            filed: "date",
            type: dataType.DATE,
            allowNull: true
        },
        content:{
            filed: "content",
            type: dataType.TEXT,
            allowNull: true
        },
        url:{
            filed: "url",
            type: dataType.TEXT,
            allowNull: true
        }
    },{
        timestamps: false,
        tableName: "webgl_appInfo"
    });
    return appInfo;
}
