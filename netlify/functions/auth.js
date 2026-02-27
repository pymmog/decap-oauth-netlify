exports.handler = async (event) => {
  const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  const state = event.queryStringParameters && event.queryStringParameters.state;

  const params = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    scope: "repo,user",
    ...(state && { state }),
  });

  return {
    statusCode: 302,
    headers: { Location: `https://github.com/login/oauth/authorize?${params}` },
    body: "",
  };
};
