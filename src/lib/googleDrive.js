import { google } from "googleapis";
import path from "path";

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve("credentials/service-account.json"),
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

export async function getDrive() {
  const client = await auth.getClient();

  return google.drive({
    version: "v3",
    auth: client,
  });
}