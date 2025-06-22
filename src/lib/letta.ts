import { LettaClient } from "@letta-ai/letta-client";

const agent_id = "agent-4d2e89d5-098b-469e-abe7-a671b4fed302";

export const letta_client = new LettaClient({
  baseUrl: "http://localhost:8283",
});

export const generate_response = async (input: string) => {
  const stream = await letta_client.agents.messages.createStream(agent_id, {
    messages: [
      {
        role: "user",
        content: input,
      },
    ],
    streamTokens: true,
  });
  return stream;
};
