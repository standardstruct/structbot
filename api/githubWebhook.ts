import { NowRequest, NowResponse } from "@vercel/node";

import reqBody from "./_lib/reqBody";
import verify from "./_lib/verifyGitHubWebhook";

import { WebClient } from "@slack/web-api";

export default async (req: NowRequest, res: NowResponse) => {
  let slack = new WebClient(process.env.SLACK_TOKEN);

  const body = await reqBody(req);
  if (
    !verify(
      process.env.GITHUB_SECRET,
      body,
      req.headers["x-hub-signature"] as string
    )
  ) {
    res.status(401).send("Not verified");
    return;
  }

  const payload = JSON.parse(body.toString());

  switch (req.headers["x-github-event"]) {
    case "ping":
      console.log("Pong!");
      break;
    case "star":
      if (payload.action == "created") {
        console.log(`Someone starred ${payload.repository.name}!`);
        await slack.chat.postMessage({
          text: `Someone just starred *${payload.repository.name}* on GitHub! :star2: :tada:`,
          channel: "C01409D1B0B",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Someone just starred *<${payload.repository.html_url}|${payload.repository.name}>* on GitHub! :star2: :tada:`,
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `It was <${payload.sender.html_url}|${payload.sender.login}>, btw`
                }
              ]
            }
          ],
        });
      }
      break;
    case "pull_request":
      console.log("PR opened!");
      if (payload.action == "opened" || payload.action == "reopened") {
        await slack.chat.postMessage({
          text: `New PR ready for review: *${payload.pull_request.title}*`,
          channel: "C01409D1B0B",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Hey <!subteam^S0160J19S3D>! There's a PR ready for review: *<${payload.pull_request.html_url}|${payload.pull_request.title}>*`,
              },
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Opened by <${payload.pull_request.user.html_url}|${payload.pull_request.user.login}> in <${payload.repository.html_url}|${payload.repository.full_name}>`,
                },
              ],
            },
          ],
        });
      }
      break;
    default:
      console.log("Cool event " + req.headers["x-github-event"]);
      break;
  }

  res.end();
};
