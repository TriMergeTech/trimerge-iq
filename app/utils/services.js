let Services = {
  profile: {
    url: "https://profile-api.savvyaisolution.com",
    api_key: "9d6653a0f982d0c04bd802ca8362257cb2d8d6d82a1d35cd194f39768d455d76",
    "x-api-version": "v2",
  },
};

const post_request = async (url, body) => {
  let service = url.split("/");
  let name = service[0].slice(1).toLowerCase();

  let service_conf = Services[name];

  url = `${service_conf.url}/${service.slice(1).join("/")}`;
  try {
    let ftch = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": service_conf["x-api-version"],
        "x-api-key": service_conf["api_key"],
      },
      body: JSON.stringify(body),
    });

    let res = await ftch.json();

    return res;
  } catch (e) {
    return { ok: false, message: "Network error." };
  }
};

export { post_request };
