require('../style/common.css');
window.$ = window.jQuery = require('jquery');
require('bootstrap');
require('../js/bootstrap-treeview');
require('../style/bootstrap-treeview.css');
require('../js/jquery-animate-css-rotate-scale');

global.Cesium = require('cesium');
require('cesium/Build/Cesium/Widgets/widgets.css');

const EventClass = require('./Class/EventClass');
global.LinkedList = require('./Class/datastructure/LinkedList');

let img = require('../img/daftpunk.jpg');

const SceneClass = require('./Class/SceneClass');

class App
{
    constructor()
    {
        this.gl = null;
        this.canvas = null;
        this.shaderProgram = null;
        this.vertexBuffer = null;
        this.prevTime = 0;
        
        this.startup();

        this.scene = new SceneClass(this.gl);
        this.init();

        requestAnimationFrame(this.renderLoop.bind(this));
        this.eventManager = new EventClass();
        this.eventManager.addListener('dataLoaded', ()=>{
            window.isLoading = false;
        })
        this.eventManager.addListener('dataLoaded', ()=>{
            window.datalist.next();
            let nxt = window.datalist.cur;
            for(let i = 0; i < 7; i++){
                $(".list"+ (i + 1)).html(nxt.getData());
                //$(".instagram-media").css("margin-bottom", "0px");
                if(nxt.next){
                    nxt = nxt.next;
                }else{
                    $(".list"+(i + 1)).html('');
                }
            }


            let r = 450;
            let arr = [window.itemPosArr[0] - r, 
            window.itemPosArr[1] - r, 
            window.itemPosArr[2] - r, 
            window.itemPosArr[3] - r, 
            window.itemPosArr[4] - r, 
            window.itemPosArr[5] - r,
            window.itemPosArr[6] - r];


            for(let i = 0; i < window.itemPosArr.length; i++){
                let radian = Math.acos(arr[i]/r);
                let y = Math.sin(radian) * r;
                y = parseInt(Math.abs(y) / 10);
                let len = parseInt($(".list" + (i+1)).css("width"));
                len = 200 + (y*4);
                $(".list" + (i+1)).css({"left" : window.itemPosArr[i], "z-index" : y});
                $(".list" + (i+1)).css("margin-top", 45 - y);
                //$(".list" + (i+1) + " .instagram-media").css("width", len+"px");
                //$(".list" + (i+1) + " .instagram-media").css("height", len+"px");
                $(".list" + (i+1) + " .instagram-media").css("width", len+"px");
                $(".list" + (i+1) + " .instagram-media").css("height", (len+100)+"px");
            }

            this.eventManager.removeListener('dataLoaded', 999999);
        }, 999999);
    }
    createGLContext(canvas){
        let names = ["webgl", "experimental-webgl"];
        let context = null;
        for(let i = 0; i < names.length; i++){
            try{
                context = canvas.getContext(names[i], { alpha: true });
            } catch(e) {}

            if(context) {
                break;
            }
        }
        if(context){
            context.viewportWidth = canvas.width;
            context.viewportHeight = canvas.height;
        } else{
            alert("Faild to create WebGL context!");
        }

        return context;
    }
    init(){
        this.scene.init();
    }
    update(){
        this.scene.update();
    }
    render(){
        this.scene.render();
    }

    test(){
        this.update();
        this.render();
    }

    startup(){
        this.canvas = document.getElementById("webGLCanvas");
        this.gl = this.createGLContext(this.canvas);

        //enable depth texture
        let ext = this.gl.getExtension('WEBGL_depth_texture');
        if (!ext) {
            return alert('need WEBGL_depth_texture');
        }

        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    }

    renderLoop(timestamp){
        if(timestamp - this.prevTime > (1000/20)){
            this.update();
            this.render();
            this.prevTime = timestamp;
        }
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    getNextSectorData(category, date, startIndex, count, completeCallback){
        if(!startIndex){
            startIndex = 0;
        }
        if(!count){
            count = 7;
        }

        //getNextSrctorDat API로 데이터를 요청하면 데이터는 오름차순으로 정렬되어 반환된다
        $.ajax({
            context: this,
            dataType: 'json',
            url: "http://localhost:8082/api/getNextSectorData/"+category+"/"+date+"/"+startIndex+"/"+count,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin","*");
                xhr.setRequestHeader("Referrer-Policy","no-referrer");
            },
            success: function(json){
                let list = json["list"];
                for(let i = 0; i < list.length; i++){
                    let id = list[i]["id"];
                    let category = list[i]["category"];
                    let date = list[i]["date"];
                    let type = list[i]["type"];
                    let content = list[i]["content"];
                    let url = list[i]["url"];
                    
                    window.datalist.addNodeLast(id, content);    
                }
                this.eventManager.fire('dataLoaded');
                
                if(completeCallback){
                    completeCallback();
                }
            },
            error: function(){
                console.log("error");
            }
        });
    }
    getPrevSectorData(category, date, startIndex, count, completeCallback){
        if(!startIndex){
            startIndex = 0;
        }
        if(!count){
            count = 7;
        }

        //getPrevSrctorDat API로 데이터를 요청하면 데이터는 내림차순으로 정렬되어 반환된다
        $.ajax({
            context: this,
            dataType: 'json',
            url: "http://localhost:8082/api/getPrevSectorData/"+category+"/"+date+"/"+startIndex+"/"+count,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin","*");
                xhr.setRequestHeader("Referrer-Policy","no-referrer");
            },
            success: function(json){
                let list = json["list"];
                for(let i = 0; i < list.length; i++){
                    let id = list[i]["id"];
                    let category = list[i]["category"];
                    let date = list[i]["date"];
                    let type = list[i]["type"];
                    let content = list[i]["content"];
                    let url = list[i]["url"];
                    
                    window.datalist.addNodeFirst(id, content);
                }
                this.eventManager.fire('dataLoaded');

                if(completeCallback){
                    completeCallback();
                }
            },
            error: function(){
                console.log("error");
            }
        });
    }
    getItem(targetId, category, date, startIndex){
        if(startIndex){
            startIndex = 0;
        }

        count = 1;

        let resultStr = "";

        $.ajax({
            context: this,
            dataType: 'json',
            url: "http://localhost:8082/api/getList/"+category+"/"+date+"/"+startIndex+"/"+count,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin","*");
                xhr.setRequestHeader("Referrer-Policy","no-referrer");
            },
            success: function(json){
                let list = json["list"];
                $(".list"+targetId).html(list[i]["content"]);
                window.lastItemIndex = list[i]["id"];
                window.firstItemIndex -= 1;
            },
            error: function(){
                console.log("error");
            }
        });
    }
}

global.App = App;