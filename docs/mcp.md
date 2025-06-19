{
  "mcpServers": {
    "perplexity-search": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@smithery/cli@latest",
        "run",
        "@arjunkmrm/perplexity-search",
        "--key",
        "d0954bc3-3ba6-4c60-a9b6-e12067070198",
        "--profile",
        "rapid-lemur-uAC040"
      ]
    },
    "Slack": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@smithery-ai/slack",
        "--key",
        "efc69848-d619-4ed1-98a8-00752144e4b0",
        "--profile",
        "tall-receptionist-W5AQW9"
      ],
      "env": {}
    },
    "server-sequential-thinking": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@smithery/cli@latest",
        "run",
        "@smithery-ai/server-sequential-thinking",
        "--key",
        "efc69848-d619-4ed1-98a8-00752144e4b0"
      ]
    },
    "supabase-mcp": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@smithery/cli@latest",
        "run",
        "@supabase-community/supabase-mcp",
        "--key",
        "efc69848-d619-4ed1-98a8-00752144e4b0",
        "--profile",
        "tall-receptionist-W5AQW9"
      ]
    },
    "Playwright Automation": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@microsoft/playwright-mcp",
        "--key",
        "efc69848-d619-4ed1-98a8-00752144e4b0"
      ],
      "env": {}
    }
  }
}
