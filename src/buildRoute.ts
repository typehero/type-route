import { UmbrellaRoute, RouterLocation, RouterContext } from "./types";
import { preventDefaultLinkClickBehavior } from "./preventDefaultLinkClickBehavior";
import { stringUtils } from "./stringUtils";

const { startsWith } = stringUtils;

export function buildRoute({
  routeName,
  params,
  location,
  routerContext,
}: {
  routeName: string | false;
  params: Record<string, unknown>;
  location: RouterLocation;
  routerContext: RouterContext;
}): UmbrellaRoute {
  const { navigate, history } = routerContext;

  let href = history.createHref({
    pathname: routeName === false ? location.fullPath : location.path,
    search: location.query ? "?" + location.query : "",
  });

  if (startsWith(href, "#")) {
    href = "/" + href;
  }

  if (routeName !== false && routerContext.baseUrl !== "/") {
    href = routerContext.baseUrl + href;
  }

  const route: UmbrellaRoute = {
    name: routeName,
    params,
    href,
    link: {
      href,
      onClick: (event) => {
        if (preventDefaultLinkClickBehavior(event)) {
          return route.push();
        }
      },
    },
    action: null,
    push: () => navigate({ ...route, action: "push" }, true),
    replace: () => navigate({ ...route, action: "replace" }, true),
  };

  return route;
}
