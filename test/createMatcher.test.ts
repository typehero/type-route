import { createMatcher } from "../src/createMatcher";
import { defineRoute } from "../src/defineRoute";
import { param } from "../src/param";
import { buildPathDef } from "../src/buildPathDef";
import { getParamDefsOfType } from "../src/getParamDefsOfType";
import {
  RouterLocation,
  PathFn,
  UmbrellaParamDefCollection,
} from "../src/types";
import { createQueryStringSerializer } from "../src/createQueryStringSerializer";

describe("createMatcher", () => {
  it("should do a simple match", () => {
    expectMatch(
      {
        userId: param.query.string,
      },
      () => `/user`,
      {
        path: "/user",
        query: "userId=hello",
      }
    ).toEqual({
      params: {
        userId: "hello",
      },
      numExtraneousParams: 0,
    });
  });

  it("should allow extraneous state", () => {
    expectMatch(
      {
        userId: param.query.string,
      },
      () => `/user`,
      {
        path: "/user",
        query: "userId=hello",
        state: {
          hello: "test",
        },
      }
    ).toEqual({
      numExtraneousParams: 1,
      params: {
        userId: "hello",
      },
    });
  });

  it("should capture extraneous query params", () => {
    expectMatch(
      {
        userId: param.query.string,
      },
      () => `/user`,
      {
        path: "/user",
        query: "userId=hello&nice=day",
        state: {
          hello: "test",
        },
      }
    ).toEqual({
      numExtraneousParams: 2,
      params: {
        userId: "hello",
      },
    });
  });

  it("should work with path with query", () => {
    expectMatch(
      {
        page: param.query.optional.number.default(1),
      },
      () => `/users`,
      {
        path: "/users",
        query: "page=2",
      }
    ).toEqual({
      numExtraneousParams: 0,
      params: {
        page: 2,
      },
    });
  });
});

function expectMatch(
  paramDefs: UmbrellaParamDefCollection,
  path: PathFn<UmbrellaParamDefCollection>,
  location: RouterLocation
) {
  const route = defineRoute(paramDefs, path);

  const match = createMatcher({
    params: route["~internal"].params,
    pathDef: buildPathDef(
      "test",
      getParamDefsOfType("path", route["~internal"].params),
      route["~internal"].path
    ),
  });

  return expect(
    match({
      routerLocation: location,
      queryStringSerializer: createQueryStringSerializer(),
      arraySeparator: ",",
    })
  );
}