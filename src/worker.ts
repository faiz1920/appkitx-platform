interface Env {
  ASSETS: {
    fetch(request: Request | URL | string): Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/404" || pathname === "/404.html") {
      const asset = await env.ASSETS.fetch(new URL("/404.html", request.url));

      return new Response(asset.body, {
        status: 404,
        statusText: "Not Found",
        headers: asset.headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
