# Next.js client

This is a ReactJS frontend - NodeJS backend app that features a connection to Google's OAUTH systems for authenticating accounts.

## Environment

Create a file named `.env` which follows this pattern:

```
PORT=3000
GOOGLE_CLIENT_ID={YOUR_CLIENT_ID}
GOOGLE_CLIENT_SECRET={YOUR_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

Both `GOOGLE_CLIENT_ID` and `GOOGLE_CALLBACK_URL` envs must be obtained from `https://console.cloud.google.com/apis/credentials?project=${YOUR_PROJECT}`
