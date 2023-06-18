export interface Env {
  OAUTH_APP_CLIENT_ID: string;
  OAUTH_APP_CLIENT_SECRET: string;
}

async function login(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);

  const redirectUri = url.searchParams.get('redirect_uri');
  if (redirectUri === null) {
    return new Response(JSON.stringify({ error: 'missing parameter \'redirect_uri\'' }), { status: 400 });
  }

  const code = url.searchParams.get('code');
  if (code === null) {
    return Response.redirect(
      `https://github.com/login/oauth/authorize?client_id=${env.OAUTH_APP_CLIENT_ID}&redirect_uri=${req.url}`,
    );
  }

  const getTokenUrl = 'https://github.com/login/oauth/access_token';
  const method = 'POST';

  const headers = new Headers();
  headers.append('Accept', 'application/json');

  const body = new FormData();
  body.append('client_id', env.OAUTH_APP_CLIENT_ID);
  body.append('client_secret', env.OAUTH_APP_CLIENT_SECRET);
  body.append('code', code);

  const tokenObj = await fetch(getTokenUrl, {
    method,
    headers,
    body,
  }).then((res) => res.json() as any);

  const token = tokenObj.access_token;
  if (token) {
    const redirect = new URL(redirectUri);
    redirect.searchParams.append('github_access_token', token);
    return Response.redirect(`${redirect}`);
  }

  return new Response(JSON.stringify(tokenObj), { status: 400 });
}

async function getComments(req: Request): Promise<Response> {
  return new Response('get comments');
}

async function postComment(req: Request): Promise<Response> {
  return new Response('post comments');
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { method } = req;
    const path = new URL(req.url).pathname;
    switch (true) {
      case method === 'GET' && path === '/login':
        return login(req, env);

      case method === 'GET' && path === '/comments':
        return getComments(req);

      case method === 'POST' && path === '/comments':
        return postComment(req);

      default:
    }

    return new Response(null, { status: 404 });
  },
};
