let DEV = process.env.NODE_ENV !== "production";

let Services = {
  profile: {
    url: "https://profile-api.savvyaisolution.com",
    api_key: process.env.NEXT_PUBLIC_PROFILE_API_KEY,
    "x-api-version": "v2",
  },
  agency: {
    url: DEV
      ? "http://localhost:8002"
      : "https://profile-api.savvyaisolution.com",
    api_key: process.env.NEXT_PUBLIC_AGENCY_API_KEY,
    "x-api-version": "v1",
  },
};

const BACKEND = DEV
  ? "http://localhost:8005"
  : "https://trimerge-iq-backend.vercel.app/";

const post_request = async (url, body) => {
  let ftch;
  try {
    if (!url.startsWith("$")) {
      url = `${BACKEND}/${url}`;

      let token = localStorage.getItem("token");
      let headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      ftch = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    } else {
      let service = url.split("/");
      let name = service[0].slice(1).toLowerCase();

      let service_conf = Services[name];

      url = `${service_conf.url}/${service.slice(1).join("/")}`;

      ftch = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": service_conf["x-api-version"],
          "x-api-key": service_conf["api_key"],
        },
        body: JSON.stringify(body),
      });
    }

    let res = await ftch.json();

    return res;
  } catch (e) {
    return { ok: false, message: "Network error." };
  }
};

export { post_request };
