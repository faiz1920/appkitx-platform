import {
  CSP_REPORT_PATH,
  createAnalyticsEngineSink,
  handleCspReportRequest,
  type AnalyticsEngineDatasetLike,
} from "./lib/csp-report";

interface Env {
  ASSETS: {
    fetch(request: Request | URL | string): Promise<Response>;
  };
  CSP_REPORTS?: AnalyticsEngineDatasetLike;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === CSP_REPORT_PATH) {
      const sink = env.CSP_REPORTS
        ? createAnalyticsEngineSink(env.CSP_REPORTS)
        : undefined;

      return handleCspReportRequest(request, sink);
    }

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
