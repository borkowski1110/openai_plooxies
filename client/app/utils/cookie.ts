import { createIsomorphicFn } from "@tanstack/react-start";
import {
  getCookie as getCookieOnServer,
  setCookie as setCookieOnServer,
  deleteCookie as deleteCookieOnServer,
} from "@tanstack/react-start/server";
import Cookies from "js-cookie";

const maxAge = ({
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
}: {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}) => ((days * 24 + hours) * 60 + minutes) * 60 + seconds;

export const getCookie = createIsomorphicFn()
  .server((cookieName: string) => getCookieOnServer(cookieName))
  .client((cookieName: string) => Cookies.get(cookieName));

type CookieAttributes = {
  /**
   * days until the cookie expires
   */
  expires?: number;
};

export const setCookie = createIsomorphicFn()
  .server((cookieName: string, value: string, attributes?: CookieAttributes) => {
    setCookieOnServer(cookieName, value, {
      ...(attributes?.expires && {
        maxAge: maxAge({ days: attributes.expires }),
      }),
    });
  })
  .client((cookieName: string, value: string, attributes?: CookieAttributes) => {
    Cookies.set(cookieName, value, {
      ...(attributes?.expires && {
        expires: attributes.expires,
      }),
    });
  });

export const deleteClientCookie = createIsomorphicFn()
  .server((cookieName: string) => deleteCookieOnServer(cookieName))
  .client((cookieName: string) => Cookies.remove(cookieName));
