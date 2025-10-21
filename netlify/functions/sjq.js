import fetch from "node-fetch";

exports.handler = async (event) => {
  try {
    const { url } = event.queryStringParameters;

    if (!url) {
      return {
        statusCode: 400,
        body: "Missing url parameter."
      };
    }

    // 发送 GET 请求，设置 redirect 为 'manual'
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual", // 禁用自动重定向
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
      }
    });

    // 检查响应状态码是否为重定向 (301, 302, 303, 307, 308)
    if (response.status >= 300 && response.status < 400) {
      // 从响应头中获取重定向的完整链接
      const longUrl = response.headers.get("location");
      
      if (!longUrl) {
          return {
              statusCode: 500,
              body: "Redirect location header is missing."
          };
      }

      console.log("Fetched long URL from header:", longUrl);

      // 正则匹配 POI ID
      const regex = /(?:poi_id_str=([^&]+)|\/poi\/([^?]+)\?utm)/;
      const match = longUrl.match(regex);
      console.log("Regex match result:", match);

      if (match) {
        const shopId = match[1] || match[2];
        console.log("Extracted POI ID:", shopId);

        const finalUrl = `https://offsiteact.meituan.com/web/hoae/collection_waimai_v8/index.html?pageSrc2=0c3bfd35279b4140b3bd8ecbc41301d6&pageSrc1=CPS_SELF_OUT_SRC_H5_LINK&pageSrc3=e15d0d4258004ba5b44c1c85e4db4084&scene=CPS_SELF_SRC&rootPvId=0e2008a4-cafa-41c1-9c14-2b1d0bd92c4b&activityId=6&poi_id_str=${shopId}&mediumSrc1=0c3bfd35279b4140b3bd8ecbc41301d6&outActivityId=6&p=1016502508465025024&mediaPvId=dafkdsajffjafdfs&mediaUserId=10086&bizId=0c3bfd35279b4140b3bd8ecbc41301d6&callback=jsonpWXLoader&poiId=-100`;

        return {
          statusCode: 200,
          body: finalUrl,
        };
      } else {
        return {
          statusCode: 404,
          body: "Shop not found in the URL."
        };
      }
    } else {
        // 如果响应状态码不是重定向，则返回错误
        return {
            statusCode: response.status,
            body: "Did not receive a redirect status code."
        };
    }

  } catch (err) {
    console.error("Error in handler:", err);
    return {
      statusCode: 500,
      body: "Internal Server Error."
    };
  }
};
