import crypto from "crypto";

export default async function getDomainSignedAPIKey(host: string) {
  const hash = crypto.createHash("sha256");
  hash.update(host);

  return hash.digest("hex");
}
