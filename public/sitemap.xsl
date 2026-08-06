<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sm xhtml">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap — snuswe.com</title>
        <style>
          body { font-family: sans-serif; font-size: 14px; color: #222; margin: 0; padding: 24px; background: #f9f9f9; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          p.sub { color: #666; margin: 0 0 20px; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
          th { background: #1a1a2e; color: #fff; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
          td { padding: 9px 14px; border-bottom: 1px solid #eee; vertical-align: middle; }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: #f4f4f8; }
          a { color: #1a56db; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .pill { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; background: #e8f0fe; color: #1a56db; }
        </style>
      </head>
      <body>
        <h1>snuswe.com — Sitemap</h1>
        <p class="sub"><xsl:value-of select="count(sm:urlset/sm:url)"/> URLs</p>
        <table>
          <tr>
            <th>URL</th>
            <th>Changefreq</th>
            <th>Priority</th>
          </tr>
          <xsl:for-each select="sm:urlset/sm:url">
            <tr>
              <td><a href="{sm:loc}"><xsl:value-of select="sm:loc"/></a></td>
              <td><span class="pill"><xsl:value-of select="sm:changefreq"/></span></td>
              <td><xsl:value-of select="sm:priority"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
