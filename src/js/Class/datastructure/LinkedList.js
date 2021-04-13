const Node = require('./Node');

class LinkedList{
    constructor(){
        this.cur = new Node(-1, null, -1);
        this.first = this.cur;
        this.last = this.cur;
        this.size = 0;
    }
    hasNext(){
        if(this.cur.next){
            return true;
        }

        return false;
    }
    getData(){
        return this.cur.getData();
    }
    getIndex(){
        return this.cur.getIndex();
    }
    prev(){
        if(this.cur.index == -1 || this.cur.index == 0){
            return;
        }

        if(this.cur.prev){
            this.cur = this.cur.prev;
        }
        
        return this.cur;
    }
    next(){
        if(!this.cur.next){
            return;
        }

        if(this.cur.next){
            this.cur = this.cur.next;
        }

        return this.cur;
    }
    addNodeLast(index, data){
        this.last.next = new Node(index, data, this.last.pos+1);
        this.last.next.prev = this.last;
        this.last = this.last.next;

        this.size++;

        if(this.last.pos == 0){
            this.first = this.last;
        }

        return this.last;
    }
    addNodeFirst(index, data){
        if(this.first.pos == -1 || this.first.pos == 0){
            console.log("linked list addNodeFirst error : first node is located at 0 or -1");
            return;
        }
        
        this.first.prev = new Node(index, data, this.first.pos-1);
        this.first.prev.next = this.first;
        this.first = this.first.prev;

        this.size++;

        return this.first;
    }

    removeLast(){
        if(this.last.pos < 0 && (this.first.pos - this.last.pos <= 0)){
            console.log('In this list, all nodes are removed');
        }

        this.last = this.last.prev;
        this.last.next = null;

        this.size--;

        return this.last;
    }

    removeFirst(){
        if(this.first.pos < 0 && (this.first.pos - this.last.pos >= 0)){
            console.log('In this list, all nodes are removed');
        }

        this.first = this.first.next;
        this.first.prev = null;

        this.size--;

        return this.first;
    }

    getSize(){
        return this.size;
    }
}

module.exports = LinkedList;