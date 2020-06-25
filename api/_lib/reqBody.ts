import { NowRequest } from "@vercel/node";

export default (req: NowRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    let body = [];
    req.on("data", (d) => {
      body.push(d);
    });
    req.on("end", () => {
      resolve(Buffer.concat(body));
    });
  });
};
