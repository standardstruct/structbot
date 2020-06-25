import { createHmac, timingSafeEqual } from "crypto";

export default (secret: string, body: Buffer, signature: string) => {
  let hash = createHmac("sha1", secret);
  hash.update(body);

  const reqHash = Buffer.from(signature);
  const computedHash = Buffer.from(`sha1=${hash.digest("hex")}`);

  return timingSafeEqual(reqHash, computedHash);
};
