import { Ngrok } from "@ngrok/ngrok-api";

const ngrok = new Ngrok({
  apiToken: "2gLZrnX1Lz7tlIEZf5fpTmXAXjv_4d2HwRRYAuge1mCPYG8GC",
});

(await ngrok.tunnels.list()).forEach((t) => console.log(t));
