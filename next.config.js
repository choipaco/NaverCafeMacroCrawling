/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  async headers() {
    return [
      {
        // 모든 경로에 대해 CORS 설정 추가
        source: '/api/:path*',  // API 경로에 따라 수정
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',  // 허용할 도메인을 구체적으로 지정하려면 '*' 대신 도메인을 입력
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',  // 허용할 HTTP 메서드
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',  // 허용할 헤더
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
