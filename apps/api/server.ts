import cors from "cors";
import { z } from "zod";
import path from "path";
import express from "express";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { prismaClient } from "@repo/database";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { systemPrompt } from "./lib/systemPrompt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { LanguageModelLike } from "@langchain/core/language_models/base";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

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

const parserSchema = z.object({
  response: z.string(),
  q: z.array(z.string()).optional(),
});

const parser = StructuredOutputParser.fromZodSchema(parserSchema);

const application = express();

application.use(express.json());
application.use(
  cors({
    origin: "*",
    methods: ["GET"],
  })
);

application.get("/assistant.ui.js", async function (request, response) {
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

application.get("/assistant/:botId", async function (request, response) {
  const assistant = await prismaClient.assistant.findFirst({
    where: {
      id: request.params.botId,
    },
  });

  return response.json({
    name: assistant?.title,
    textColor: assistant?.textColor,
    accentColor: assistant?.accentColor,
    backgroundColor: assistant?.backgroundColor,
  });
});

application.post("/assistant/:botId", async function (request, response) {
  const referer = request.get("referer") || request.get("referrer");

  if (referer) {
    const botId = request.params.botId;
    const requestUrl = new URL(referer);

    if (
      !botId.match(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
      )
    ) {
      return response.status(400).json({
        message: "Invalid botId format specified!",
      });
    }

    const assistant = await prismaClient.assistant.findFirst({
      where: {
        id: botId,
        Domain: {
          every: {
            name: requestUrl.host!,
          },
        },
      },
      include: {
        Context: true,
      },
    });

    if (!assistant) {
      response.setHeader("Content-Type", "application/json");

      return response.status(401).json({
        message: "Unable to find the assistant with the provided botId!",
      });
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 100,
    });

    const splits = await splitter.splitDocuments([
      new Document({
        pageContent: assistant.Context[0].context,
        metadata: {
          source: "business-context",
        },
      }),

      new Document({
        pageContent: assistant.Context[0].additional,
        metadata: {
          source: "additional-information",
        },
      }),
    ]);

    const vectorStore = await MemoryVectorStore.fromDocuments(
      splits,
      new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_SECRET_KEY,
      })
    );

    const retriever = vectorStore.asRetriever();
    const ragChain = await createStuffDocumentsChain({
      llm: openai,
      prompt: new PromptTemplate({
        template: systemPrompt({
          name: assistant.title,
        }),
        inputVariables: ["context", "question"],
      }),
    });

    const question =
      request.body.messages[request.body.messages.length - 1].content;

    const completion = await ragChain.stream({
      question: question,
      context: await retriever.invoke(question),
    });

    response.setHeader("Content-Type", "text/plain");
    response.setHeader("Transfer-Encoding", "chunked");
    response.flushHeaders();

    for await (const chunk of completion) {
      if (chunk) {
        response.write(chunk);
      }
    }

    return response.end();
  }

  return response.status(400).json({
    message: "Unable to validate the requesting domain!",
  });
});

application.listen(process.env.PORT, function () {
  console.log("Server running on PORT: " + process.env.PORT);
});
