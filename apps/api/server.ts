import cors from "cors";
import path from "path";
import express from "express";
import { config } from "dotenv";
import { prismaClient } from "@repo/database";
import { systemPrompt } from "./lib/systemPrompt";
import { readFileSync } from "fs";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

if (process.env.NODE_ENV !== "production") {
  config();
}

const openai = new ChatOpenAI({
  model: "gpt-4o",
  maxTokens: 150,
  streaming: true,
  presencePenalty: 0,
  temperature: 0.5,
  frequencyPenalty: 0,
  apiKey: process.env.OPENAI_SECRET_KEY,
});

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

    const completion = await openai.stream(
      [
        new SystemMessage(
          systemPrompt({
            name: assistant.title,
            businessContext: assistant.Context[0]?.context,
            additionalInformation: assistant.Context[0]?.additional,
          })
        ),
        ...request.body.messages
          .slice(0, request.body.messages.length)
          .map(({ content }: { content: string }) => new HumanMessage(content)),
        new HumanMessage(
          `json response must contain a response field with a string value and additional click to ask follow up questions that customer would ask on given response (q) optional field as array. ${request.body.messages[request.body.messages.length - 1].content}`
        ),
      ],
      {
        response_format: {
          type: "json_object",
        },
      }
    );

    response.setHeader("Content-Type", "text/plain");
    response.setHeader("Transfer-Encoding", "chunked");
    response.flushHeaders();

    for await (const chunk of completion) {
      if (chunk) {
        response.write(chunk.content);
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
