"use client";

import { useCopilotChat } from "@copilotkit/react-core";
import { useEffect } from "react";

function McpServerManager() {
  const { setMcpServers } = useCopilotChat();

  useEffect(() => {
    setMcpServers([
      {
        // Try a sample MCP server at https://mcp.composio.dev/
        endpoint: "your_mcp_sse_url",
      },
    ]);
  }, [setMcpServers]);

  return null;
}

export default McpServerManager;
