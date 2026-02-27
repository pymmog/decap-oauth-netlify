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

    // This postMessage script is what Decap CMS listens for
    const script = `
<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<script>
(function() {
  function receiveMessage(e) {
    console.log("receiveMessage %o", e);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage(
    'authorization:github:success:${JSON.stringify({ token, provider: "github" }).replace(/'/g, "\\'")}',
    "*"
  );
})();
<\/script>
<p>Authenticated. You may close this window.</p>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: script,
    };
  } catch (err) {
    return { statusCode: 500, body: `Server error: ${err.message}` };
  }
};
