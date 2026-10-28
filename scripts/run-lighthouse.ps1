$env:CHROME_PATH = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
& npx --yes lighthouse "http://127.0.0.1:3000/courses" `
  "--only-categories=performance,accessibility,seo" `
  "--form-factor=mobile" `
  "--screenEmulation.mobile=true" `
  "--screenEmulation.width=390" `
  "--screenEmulation.height=844" `
  "--screenEmulation.deviceScaleFactor=1" `
  "--throttling-method=simulate" `
  "--chrome-flags=--headless=new --no-sandbox" `
  "--output=json" `
  "--output=html" `
  "--output-path=docs/lighthouse-courses-mobile" `
  "--quiet"
