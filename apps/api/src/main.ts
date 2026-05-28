import "dotenv/config";
import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module.js";

const port = Number(process.env.PORT ?? 3001);

const app = await NestFactory.create(AppModule);

const swaggerConfig = new DocumentBuilder()
  .setTitle("BlockForge API")
  .setDescription("Read API for indexed NFT marketplace data.")
  .setVersion("0.1.0")
  .build();

const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup("docs", app, swaggerDocument);

await app.listen(port);
