module.exports = (notificationMessage, imageUrl) => `
<!DOCTYPE html>
<html>
<head>
  <title>Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .header {
      text-align: center;
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .content {
      padding: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 10px 0;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #777;
    }
    .image {
      text-align: center;
      margin: 20px 0;
    }
    .image img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Agapay Alert</h1>
    </div>
    <div class="content">
      <p>${notificationMessage}</p>
      ${imageUrl ? `<div class="image"><img src="${imageUrl}" alt="Image"></div>` : ''}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Agapay Alert. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;