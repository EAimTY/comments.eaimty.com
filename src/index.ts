export interface Env {
  API_KEY: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    console.warn(req, env.API_KEY);
    return new Response(null, { status: 403 });
  },
};
