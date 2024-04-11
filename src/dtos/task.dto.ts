import {types} from "node:util";

export class CreateTaskDto {
    constructor(content_: any, type_: string = "dummy") {
        this.content = content_
        this.taskType = type_
    }

    public static fromJson(json: any) {
        return new CreateTaskDto(json.content, json.taskType)
    }

    public content : any;
    public taskType : string;
}