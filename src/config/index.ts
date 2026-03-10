export const API_CONFIG = {
  SINA_STOCK: {
    BASE_URL: 'https://hq.sinajs.cn/list=',
    HEADERS: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://finance.sina.com.cn/'
    }
  },
  TENCENT_STOCK: {
    BASE_URL: 'https://qt.gtimg.cn/q=',
    HEADERS: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
    }
  },
  FUND: {
    BASE_URL: 'http://fundgz.1234567.com.cn/js/'
  },
  REQUEST_DELAY: 500
} as const

export type ApiConfig = typeof API_CONFIG
