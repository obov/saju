const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
});

exports.handler = async (event) => {
  try {
    // 헬스 체크 엔드포인트
    if (event.path === "/health") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          status: "healthy",
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // API Gateway에서 파일명을 쿼리 파라미터로 받음
    const filename = event.queryStringParameters?.filename;

    if (!filename) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "filename is required in query parameters",
        }),
      };
    }

    // S3에서 파일 가져오기
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME, // 환경변수로 버킷명 관리
      Key: filename,
    });

    // pre-signed URL 생성 (5분 유효)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        url: signedUrl,
        filename: filename,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing file",
        error: error.message,
      }),
    };
  }
};

// 스트림을 문자열로 변환하는 헬퍼 함수
const streamToString = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
};
