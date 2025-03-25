"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ntfy.ts
var ntfy_exports = {};
__export(ntfy_exports, {
  default: () => main
});
module.exports = __toCommonJS(ntfy_exports);
var import_api = require("@raycast/api");
var parseMessage = async ({ url, message }, topic) => {
  if (!!message && !url) {
    return { topic, title: "Your Message", tags: "speech_balloon", message };
  }
  const selectedText = await (0, import_api.getSelectedText)().catch(() => "");
  const isUrl = URL.canParse(url || message || selectedText);
  if (isUrl) {
    const link = url || message || selectedText;
    return {
      topic,
      title: "Your Link",
      tags: "link",
      message: message || link,
      click: link
    };
  }
  if (!message && !url && selectedText) {
    return { topic, title: "Your Selected Text", tags: "clipboard", message: selectedText };
  }
  return {
    topic,
    title: "Your Ping",
    tags: "ping_pong"
  };
};
async function main(props) {
  try {
    const preferences = (0, import_api.getPreferenceValues)();
    const topic = props.arguments.topic || preferences.defaultTopic;
    if (!topic) throw new Error("No topic provided");
    const { tags, ...body } = await parseMessage(props.arguments, topic);
    const response = await fetch("https://ntfy.sh", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache": "no", ...tags ? { tags } : {} },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    await (0, import_api.closeMainWindow)();
    (0, import_api.showToast)({
      style: import_api.Toast.Style.Success,
      title: `Sent ${tags} to: ${topic}`
    });
  } catch (error) {
    (0, import_api.showToast)({
      style: import_api.Toast.Style.Failure,
      title: "Failed to Send Notification",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL250ZnkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGNsb3NlTWFpbldpbmRvdywgZ2V0UHJlZmVyZW5jZVZhbHVlcywgZ2V0U2VsZWN0ZWRUZXh0LCBzaG93VG9hc3QsIFRvYXN0IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiXG5cbnR5cGUgQXJndW1lbnRzID0ge1xuICB1cmw/OiBzdHJpbmdcbiAgbWVzc2FnZT86IHN0cmluZ1xuICB0b3BpYz86IHN0cmluZ1xufVxuXG50eXBlIFByZWZlcmVuY2VzID0ge1xuICBkZWZhdWx0VG9waWM6IHN0cmluZ1xufVxuXG50eXBlIE1lc3NhZ2UgPSB7XG4gIHRpdGxlOiBzdHJpbmdcbiAgdG9waWM6IHN0cmluZ1xuICB0YWdzPzogc3RyaW5nXG4gIG1lc3NhZ2U/OiBzdHJpbmdcbiAgY2xpY2s/OiBzdHJpbmdcbn1cblxuY29uc3QgcGFyc2VNZXNzYWdlID0gYXN5bmMgKHsgdXJsLCBtZXNzYWdlIH06IHsgdXJsPzogc3RyaW5nOyBtZXNzYWdlPzogc3RyaW5nIH0sIHRvcGljOiBzdHJpbmcpOiBQcm9taXNlPE1lc3NhZ2U+ID0+IHtcbiAgLy8gSXMgbWVzc2FnZSBvbmx5XG4gIGlmICghIW1lc3NhZ2UgJiYgIXVybCkge1xuICAgIHJldHVybiB7IHRvcGljLCB0aXRsZTogXCJZb3VyIE1lc3NhZ2VcIiwgdGFnczogXCJzcGVlY2hfYmFsbG9vblwiLCBtZXNzYWdlIH1cbiAgfVxuXG4gIGNvbnN0IHNlbGVjdGVkVGV4dCA9IGF3YWl0IGdldFNlbGVjdGVkVGV4dCgpLmNhdGNoKCgpID0+IFwiXCIpXG4gIGNvbnN0IGlzVXJsID0gVVJMLmNhblBhcnNlKHVybCB8fCBtZXNzYWdlIHx8IHNlbGVjdGVkVGV4dClcblxuICAvLyBJcyBsaW5rXG4gIGlmIChpc1VybCkge1xuICAgIGNvbnN0IGxpbmsgPSB1cmwgfHwgbWVzc2FnZSB8fCBzZWxlY3RlZFRleHRcbiAgICByZXR1cm4ge1xuICAgICAgdG9waWMsXG4gICAgICB0aXRsZTogXCJZb3VyIExpbmtcIixcbiAgICAgIHRhZ3M6IFwibGlua1wiLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSB8fCBsaW5rLFxuICAgICAgY2xpY2s6IGxpbmssXG4gICAgfVxuICB9XG5cbiAgLy8gSXMgc2VsZWN0ZWQgdGV4dFxuICBpZiAoIW1lc3NhZ2UgJiYgIXVybCAmJiBzZWxlY3RlZFRleHQpIHtcbiAgICByZXR1cm4geyB0b3BpYywgdGl0bGU6IFwiWW91ciBTZWxlY3RlZCBUZXh0XCIsIHRhZ3M6IFwiY2xpcGJvYXJkXCIsIG1lc3NhZ2U6IHNlbGVjdGVkVGV4dCB9XG4gIH1cblxuICAvLyBJcyBwaW5nXG4gIHJldHVybiB7XG4gICAgdG9waWMsXG4gICAgdGl0bGU6IFwiWW91ciBQaW5nXCIsXG4gICAgdGFnczogXCJwaW5nX3BvbmdcIixcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBtYWluKHByb3BzOiB7IGFyZ3VtZW50czogQXJndW1lbnRzIH0pIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwcmVmZXJlbmNlcyA9IGdldFByZWZlcmVuY2VWYWx1ZXM8UHJlZmVyZW5jZXM+KClcbiAgICBjb25zdCB0b3BpYyA9IHByb3BzLmFyZ3VtZW50cy50b3BpYyB8fCBwcmVmZXJlbmNlcy5kZWZhdWx0VG9waWNcblxuICAgIGlmICghdG9waWMpIHRocm93IG5ldyBFcnJvcihcIk5vIHRvcGljIHByb3ZpZGVkXCIpXG5cbiAgICBjb25zdCB7IHRhZ3MsIC4uLmJvZHkgfSA9IGF3YWl0IHBhcnNlTWVzc2FnZShwcm9wcy5hcmd1bWVudHMsIHRvcGljKVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcImh0dHBzOi8vbnRmeS5zaFwiLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiwgXCJDYWNoZVwiOiBcIm5vXCIsIC4uLih0YWdzID8geyB0YWdzIH0gOiB7fSkgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIH0pXG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgZXJyb3IhIFN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9YClcblxuICAgIGF3YWl0IGNsb3NlTWFpbldpbmRvdygpXG5cbiAgICBzaG93VG9hc3Qoe1xuICAgICAgc3R5bGU6IFRvYXN0LlN0eWxlLlN1Y2Nlc3MsXG4gICAgICB0aXRsZTogYFNlbnQgJHt0YWdzfSB0bzogJHt0b3BpY31gLFxuICAgIH0pXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgc2hvd1RvYXN0KHtcbiAgICAgIHN0eWxlOiBUb2FzdC5TdHlsZS5GYWlsdXJlLFxuICAgICAgdGl0bGU6IFwiRmFpbGVkIHRvIFNlbmQgTm90aWZpY2F0aW9uXCIsXG4gICAgICBtZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvciksXG4gICAgfSlcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQXdGO0FBb0J4RixJQUFNLGVBQWUsT0FBTyxFQUFFLEtBQUssUUFBUSxHQUF1QyxVQUFvQztBQUVwSCxNQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSztBQUNyQixXQUFPLEVBQUUsT0FBTyxPQUFPLGdCQUFnQixNQUFNLGtCQUFrQixRQUFRO0FBQUEsRUFDekU7QUFFQSxRQUFNLGVBQWUsVUFBTSw0QkFBZ0IsRUFBRSxNQUFNLE1BQU0sRUFBRTtBQUMzRCxRQUFNLFFBQVEsSUFBSSxTQUFTLE9BQU8sV0FBVyxZQUFZO0FBR3pELE1BQUksT0FBTztBQUNULFVBQU0sT0FBTyxPQUFPLFdBQVc7QUFDL0IsV0FBTztBQUFBLE1BQ0w7QUFBQSxNQUNBLE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFNBQVMsV0FBVztBQUFBLE1BQ3BCLE9BQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUdBLE1BQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxjQUFjO0FBQ3BDLFdBQU8sRUFBRSxPQUFPLE9BQU8sc0JBQXNCLE1BQU0sYUFBYSxTQUFTLGFBQWE7QUFBQSxFQUN4RjtBQUdBLFNBQU87QUFBQSxJQUNMO0FBQUEsSUFDQSxPQUFPO0FBQUEsSUFDUCxNQUFNO0FBQUEsRUFDUjtBQUNGO0FBRUEsZUFBTyxLQUE0QixPQUFpQztBQUNsRSxNQUFJO0FBQ0YsVUFBTSxrQkFBYyxnQ0FBaUM7QUFDckQsVUFBTSxRQUFRLE1BQU0sVUFBVSxTQUFTLFlBQVk7QUFFbkQsUUFBSSxDQUFDLE1BQU8sT0FBTSxJQUFJLE1BQU0sbUJBQW1CO0FBRS9DLFVBQU0sRUFBRSxNQUFNLEdBQUcsS0FBSyxJQUFJLE1BQU0sYUFBYSxNQUFNLFdBQVcsS0FBSztBQUVuRSxVQUFNLFdBQVcsTUFBTSxNQUFNLG1CQUFtQjtBQUFBLE1BQzlDLFFBQVE7QUFBQSxNQUNSLFNBQVMsRUFBRSxnQkFBZ0Isb0JBQW9CLFNBQVMsTUFBTSxHQUFJLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFHO0FBQUEsTUFDeEYsTUFBTSxLQUFLLFVBQVUsSUFBSTtBQUFBLElBQzNCLENBQUM7QUFFRCxRQUFJLENBQUMsU0FBUyxHQUFJLE9BQU0sSUFBSSxNQUFNLHVCQUF1QixTQUFTLE1BQU0sRUFBRTtBQUUxRSxjQUFNLDRCQUFnQjtBQUV0Qiw4QkFBVTtBQUFBLE1BQ1IsT0FBTyxpQkFBTSxNQUFNO0FBQUEsTUFDbkIsT0FBTyxRQUFRLElBQUksUUFBUSxLQUFLO0FBQUEsSUFDbEMsQ0FBQztBQUFBLEVBQ0gsU0FBUyxPQUFPO0FBQ2QsOEJBQVU7QUFBQSxNQUNSLE9BQU8saUJBQU0sTUFBTTtBQUFBLE1BQ25CLE9BQU87QUFBQSxNQUNQLFNBQVMsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLE9BQU8sS0FBSztBQUFBLElBQ2hFLENBQUM7QUFBQSxFQUNIO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
