import cors from "cors";
import { z } from "zod";
import path from "path";
import express from "express";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { prismaClient } from "@repo/database";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { systemPrompt } from "./lib/systemPrompt";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { formatDocumentsAsString } from "langchain/util/document";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";

if (process.env.NODE_ENV !== "production") {
  config();
}

const openai = new ChatOpenAI({
  model: "gpt-4o",
  maxTokens: 150,
  streaming: true,
  streamUsage: true,
  presencePenalty: 0,
  temperature: 0.5,
  frequencyPenalty: 0,
  apiKey: process.env.OPENAI_SECRET_KEY,
});

const storeEmailTool = tool(
  async ({ email }) => {
    console.log(email);

    return JSON.stringify({
      status: "success",
    });
  },
  {
    name: "store-email",
    description:
      "Stores the user's email in the database if provided during the conversation. Only accepts valid and non-temporary emails.",
    schema: z.object({
      email: z.string().email(),
    }),
  }
);

const languageModel = openai.bindTools([storeEmailTool]).bind({
  response_format: {
    type: "json_object",
  },
});

const application = express();

application.use(express.json());
application.use(cors({ origin: "*", methods: ["GET"] }));

application.get("/assistant.ui.js", async (request, response) => {
  const jsonrepairJsFilePath = path.join(
    __dirname,
    "resources",
    "jsonrepair.js"
  );
  const assistantUiJsFilePath = path.join(
    __dirname,
    "resources",
    "assistant.ui.js"
  );

  const jsonrepairJsContents = readFileSync(jsonrepairJsFilePath, "utf-8");
  const assistantUiJsContents = readFileSync(assistantUiJsFilePath, "utf-8");

  response.setHeader("Content-Type", "application/javascript");
  response.write(jsonrepairJsContents);
  response.write(";;;;;;;;;;;;;;;;;;;");
  response.write(assistantUiJsContents);
  response.end();
});

application.get("/assistant/:botId", async (request, response) => {
  const assistant = await prismaClient.assistant.findFirst({
    where: { id: request.params.botId },
  });

  response.json({
    name: assistant?.title,
    textColor: assistant?.textColor,
    accentColor: assistant?.accentColor,
    backgroundColor: assistant?.backgroundColor,
  });
});

application.post("/assistant/:botId", async (request, response) => {
  const referer = request.get("referer") || request.get("referrer");

  if (!referer) {
    return response
      .status(400)
      .json({ message: "Unable to validate the requesting domain!" });
  }

  const botId = request.params.botId;
  const requestUrl = new URL(referer);

  if (
    !botId.match(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    )
  ) {
    return response
      .status(400)
      .json({ message: "Invalid botId format specified!" });
  }

  const assistant = await prismaClient.assistant.findFirst({
    where: {
      id: botId,
      Domain: { every: { name: requestUrl.host } },
    },
    include: { Context: true },
  });

  if (!assistant) {
    return response.status(401).json({
      message: "Unable to find the assistant with the provided botId!",
    });
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 100,
  });

  const splits = await splitter.splitDocuments([
    ...assistant.Context.map(
      (context) =>
        new Document({
          pageContent: context.context,
          metadata: { source: "business-information" },
        })
    ),
    ...assistant.Context.map(
      (context) =>
        new Document({
          pageContent: context.additional,
          metadata: { source: "additional-information" },
        })
    ),
  ]);

  const vectorStore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings({ apiKey: process.env.OPENAI_SECRET_KEY })
  );
  const retriever = vectorStore.asRetriever();

  const conversationalChainPromptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt({ name: assistant.title })],
    new MessagesPlaceholder("history"),
    ["human", "{question}"],
  ]);

  const conversationalChain = conversationalChainPromptTemplate
    .pipe(languageModel)
    .pipe(new StringOutputParser());

  const contextualizedQuestion = (input: Record<string, unknown>) => {
    return "history" in input ? conversationalChain : input.question;
  };

  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input: Record<string, unknown>) => {
        return "history" in input
          ? (contextualizedQuestion(input) as typeof conversationalChain)
              .pipe(retriever)
              .pipe(formatDocumentsAsString)
          : "";
      },
    }),
    conversationalChainPromptTemplate,
    languageModel,
  ]);

  const question =
    request.body.messages[request.body.messages.length - 1].content;
  const completion = await ragChain.stream({
    question,
    history: request.body.messages.map(
      ({ role, content }: { role: "user" | "assistant"; content: string }) =>
        role === "user" ? new HumanMessage(content) : new AIMessage(content)
    ),
    context: await retriever.invoke(question),
  });

  response.setHeader("Content-Type", "text/plain");
  response.setHeader("Transfer-Encoding", "chunked");
  response.flushHeaders();

  for await (const chunk of completion) {
    if (chunk) {
      response.write(chunk.content as string);
    }
  }

  response.end();
});

application.listen(process.env.PORT, () => {
  console.log(`Server running on PORT: ${process.env.PORT}`);
});
