const allowedFrontends = {
  "http://localhost:3000": "http://localhost:3000/",
  "http://127.0.0.1:3000": "http://127.0.0.1:3000/",
  "https://ydovzhyk.github.io": "https://ydovzhyk.github.io/easy-shop/",
  "https://easy-shop-team.netlify.app": "https://easy-shop-team.netlify.app/",
};

const fallbackFrontendUrl =
  process.env.NODE_ENV === "production"
    ? "https://ydovzhyk.github.io/easy-shop/"
    : "http://localhost:3000/";

const encodeReferer = (referer = "") =>
  Buffer.from(String(referer), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const decodeReferer = state => {
  if (!state || typeof state !== "string") return "";
  try {
    const normalized = state.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (normalized.length % 4)) % 4;
    const decoded = Buffer.from(
      normalized + "=".repeat(padLength),
      "base64"
    ).toString("utf8");
    if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
      return decoded;
    }
  } catch (error) {
    return "";
  }
  return "";
};

const resolveFrontendUrl = referer => {
  if (!referer || typeof referer !== "string") return fallbackFrontendUrl;
  try {
    const origin = new URL(referer).origin;
    return allowedFrontends[origin] || fallbackFrontendUrl;
  } catch (error) {
    return fallbackFrontendUrl;
  }
};

const getRequestReferer = req => {
  const fromState = decodeReferer(req.query && req.query.state);
  if (fromState) return fromState;
  if (req.session && typeof req.session.referer === "string") {
    return req.session.referer;
  }
  return req.headers.referer || req.headers.origin || "";
};

module.exports = {
  encodeReferer,
  decodeReferer,
  resolveFrontendUrl,
  getRequestReferer,
};
