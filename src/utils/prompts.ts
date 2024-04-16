
/**
 * Compose a string from a list of prompts
 * @param prompts
 */
function composePrompts(prompts: any) : string {
    return prompts.reduce((prompt : string, v: any) => {
        return prompt + (v.role === "user") ? v.content : ""
    }, "")
}

export {
    composePrompts
}