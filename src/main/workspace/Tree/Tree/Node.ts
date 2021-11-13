export default abstract class Node {

    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    public getName():String {
        return this.name;
    }

    public abstract addChild(node :Node): void;
    

  

}