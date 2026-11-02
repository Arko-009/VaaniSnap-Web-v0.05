// Main Application Entry Point
import { AppController } from "./ui/appController.js";
import { PublishingController } from "./ui/publishingController.js";

document.addEventListener("DOMContentLoaded", () => {
  const appController = new AppController();
  appController.init();

  const publishingController = new PublishingController(appController);
  publishingController.init();

  console.log("VaaniSnap Web Application initialized successfully.");
});
