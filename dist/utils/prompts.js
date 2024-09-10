"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePromptId = exports.composePrompts = void 0;
/**
 * Compose a string from a list of prompts
 * @param prompts
 */
function composePrompts(prompts) {
    return prompts.reduce((prompt, v) => {
        return prompt + ((v.role === "user") ? v.content : "");
    }, "");
}
exports.composePrompts = composePrompts;
function removePromptId(prompts) {
    return prompts.map((p) => {
        return {
            role: p.role,
            content: p.content
        };
    });
}
exports.removePromptId = removePromptId;
//# sourceMappingURL=prompts.js.map