interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface AssistantMessage {
  role: "assistant";
  content?: string | null;
  tool_calls?: ToolCall[];
}

interface GroqResponse {
  choices?: Array<{ message?: AssistantMessage }>;
}

type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function completion(messages: unknown[], tools?: ToolDefinition[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ-NOT-CONFIGURED");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
      temperature: 0.1,
      max_completion_tokens: 500,
      messages,
      ...(tools ? { tools, tool_choice: "auto" } : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new Error("GROQ-REQUEST-FAILED");
  const data = (await response.json()) as GroqResponse;
  const message = data.choices?.[0]?.message;
  if (!message) throw new Error("GROQ-EMPTY-RESPONSE");
  return message;
}

const groqServices = {
  askWithTools: async (
    question: string,
    role: "ADMIN" | "CLIENT",
    tools: ToolDefinition[],
    executeTool: (name: string, args: Record<string, unknown>) => Promise<unknown>,
  ) => {
    const messages: unknown[] = [
      {
        role: "system",
        content: `Sos el asistente de una tienda educativa. El usuario es ${role}. Respondé en español, breve y claro. Para datos del catálogo y pagos usá una herramienta; nunca inventes información. Solo podés consultar y, si el usuario es ADMIN, también crear productos con la herramienta crear_producto (la imagen es opcional). No realices otras altas, cambios ni eliminaciones. El estado PAID significa que la orden fue pagada y PENDING que todavía está pendiente.`,
      },
      { role: "user", content: question },
    ];

    const firstAnswer = await completion(messages, tools);
    const toolCall = firstAnswer.tool_calls?.[0];
    if (!toolCall) {
      const answer = firstAnswer.content?.trim();
      if (!answer) throw new Error("GROQ-EMPTY-RESPONSE");
      return answer;
    }

    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
    } catch {
      throw new Error("GROQ-INVALID-TOOL-ARGUMENTS");
    }

    const result = await executeTool(toolCall.function.name, args);
    const finalAnswer = await completion([
      ...messages,
      firstAnswer,
      {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      },
    ]);
    const answer = finalAnswer.content?.trim();
    if (!answer) throw new Error("GROQ-EMPTY-RESPONSE");
    return answer;
  },
};

export type { ToolDefinition };
export { groqServices };
