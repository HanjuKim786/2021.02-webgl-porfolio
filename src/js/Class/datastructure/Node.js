class Node {
    /*
        index :  index 속성을 나타냄
        data :  data 속성을 나타냄
        pos : list내 node의 위치를 나타냄
    */
    constructor(index, data, pos){
        this.index = index;
        this.data = data;
        this.pos = pos;
        this.prev = null;
        this.next = null;
    }

    getData(){
        return this.data;
    }
    getIndex(){
        return this.index;
    }
}

module.exports = Node;