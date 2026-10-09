import { Config } from "@remotion/cli/config";

Config.setPublicDir("./assets");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
// Use a local Chromium if one is set, otherwise Remotion downloads its own.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
