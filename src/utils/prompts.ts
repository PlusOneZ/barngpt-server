
/**
 * Compose a string from a list of prompts
 * @param prompts
 */
function composePrompts(prompts: any) : string {
    return prompts.reduce((prompt : string, v: any) => {
        return prompt + (v.role === "user") ? v.content : ""
    }, "")
}

function removePromptId(prompts: any) {
    return prompts.map((p: any) => {
        return {
            role: p.role,
            content: p.content
        }
    })
}

export {
    composePrompts,
    removePromptId
}