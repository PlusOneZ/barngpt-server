import {types} from "node:util";

export class CreateTaskDto {
    constructor(content_: any) {
        this.content = content_
    }

    public content : any;
}