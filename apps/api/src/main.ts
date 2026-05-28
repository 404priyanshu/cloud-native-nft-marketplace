import "dotenv/config";
import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module.js";
import { AppConfigService } from "./config/app-config.service.js";

const app = await NestFactory.create(AppModule);
const config = app.get(AppConfigService);

app.enableCors({
  origin: config.corsOrigin === "*" ? true : config.corsOrigin,
});
app.useGlobalPipes(
  new ValidationPipe({
    forbidNonWhitelisted: true,
    transform: true,
    whitelist: true,
  }),
);

const swaggerConfig = new DocumentBuilder()
  .setTitle("BlockForge API")
  .setDescription("Read API for indexed NFT marketplace data.")
  .setVersion("0.1.0")
  .addBearerAuth()
  .build();

const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup("docs", app, swaggerDocument);

await app.listen(config.port);
