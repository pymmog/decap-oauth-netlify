const https = require("https");

function post(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const code = event.queryStringParameters && event.queryStringParameters.code;

  if (!code) {
    return { statusCode: 400, body: "Missing code parameter" };
  }

  const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

  const body = JSON.stringify({
    client_id: OAUTH_CLIENT_ID,
    client_secret: OAUTH_CLIENT_SECRET,
    code,
  });

  const options = {
    hostname: "github.com",
    path: "/login/oauth/access_token",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  try {
    const response = await post(options, body);
    const parsed = JSON.parse(response);
    const token = parsed.access_token;

    if (!token) {
      return {
        statusCode: 400,
        body: `GitHub OAuth error: ${JSON.stringify(parsed)}`,
      };
    }

    const content = JSON.stringify({ token, provider: "github" });
    const message = `authorization:github:success:${content}`;

    const html = `<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<p>Authenticated. You may close this window.</p>
<script>
(function() {
  var message = ${JSON.stringify(message)};
  function sendMessage() {
    if (window.opener) {
      window.opener.postMessage(message, "*");
      setTimeout(function() { window.close(); }, 1000);
    } else {
      setTimeout(sendMessage, 100);
    }
  }
  sendMessage();
})();
</script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html,
    };
  } catch (err) {
    return { statusCode: 500, body: `Server error: ${err.message}` };
  }
};
