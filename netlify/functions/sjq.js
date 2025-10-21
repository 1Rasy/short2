export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      // 如果路径是 /sjq=xxxx，就执行你的函数逻辑
      const matchParam = url.pathname.match(/\/sjq=([^/?&]+)/);
      if (matchParam) {
        const inputUrl = matchParam[1];

        if (!inputUrl) {
          return new Response("Missing url parameter.", { status: 400 });
        }

        // 使用 Worker 自带 fetch 请求外部 URL，禁止重定向
        const response = await fetch(inputUrl, {
          method: "GET",
          redirect: "manual",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
          }
        });

        // 检查是否为重定向
        if (response.status >= 300 && response.status < 400) {
          const longUrl = response.headers.get("location");

          if (!longUrl) {
            return new Response("Redirect location header is missing.", { status: 500 });
          }

          // 正则匹配 POI ID
          const regex = /(?:poi_id_str=([^&]+)|\/poi\/([^?]+)\?utm)/;
          const match = longUrl.match(regex);

          if (match) {
            const shopId = match[1] || match[2];
            const finalUrl = `https://offsiteact.meituan.com/web/hoae/collection_waimai_v8/index.html?pageSrc2=0c3bfd35279b4140b3bd8ecbc41301d6&pageSrc1=CPS_SELF_OUT_SRC_H5_LINK&pageSrc3=e15d0d4258004ba5b44c1c85e4db4084&scene=CPS_SELF_SRC&rootPvId=0e2008a4-cafa-41c1-9c14-2b1d0bd92c4b&activityId=6&poi_id_str=${shopId}&mediumSrc1=0c3bfd35279b4140b3bd8ecbc41301d6&outActivityId=6&p=1016502508465025024&mediaPvId=dafkdsajffjafdfs&mediaUserId=10086&bizId=0c3bfd35279b4140b3bd8ecbc41301d6&callback=jsonpWXLoader&poiId=-100`;

            return new Response(finalUrl, { status: 200, headers: { "Content-Type": "text/plain" } });
          } else {
            return new Response("Shop not found in the URL.", { status: 404 });
          }
        } else {
          return new Response("Did not receive a redirect status code.", { status: response.status });
        }
      }

      // 如果不是 /sjq=xxxx，则返回静态资源（index.html 或 main.js）
      return env.ASSETS.fetch(request);

    } catch (err) {
      return new Response("Internal Server Error: " + err.message, { status: 500 });
    }
  }
};
