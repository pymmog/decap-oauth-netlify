exports.handler = async (event) => {
  const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${OAUTH_CLIENT_ID}&scope=repo,user`;

  return {
    statusCode: 302,
    headers: { Location: redirectUrl },
    body: "",
  };
};
