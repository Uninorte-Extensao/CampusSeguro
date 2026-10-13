/**
 * Injeta as meta tags de PWA no dist/index.html gerado pelo `expo export -p web`.
 *
 * No modo web.output = "single", o Expo usa um index.html genérico e ignora o
 * app/+html.tsx — então adicionamos as tags aqui, após o build. Isso faz o app
 * abrir em TELA CHEIA (sem as barras do navegador) ao usar "Adicionar à tela de
 * início" no celular. Rodado no build da Vercel: `expo export -p web && node inject-pwa.js`.
 */
const fs = require("fs");
const path = require("path");

const arquivo = path.join(__dirname, "dist", "index.html");

if (!fs.existsSync(arquivo)) {
  console.error("inject-pwa: dist/index.html não encontrado. O export rodou?");
  process.exit(1);
}

let html = fs.readFileSync(arquivo, "utf8");

const tags = `    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Campus Seguro" />
    <meta name="theme-color" content="#0B1020" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon.png" />
  `;

// Idempotente: não duplica se rodar de novo
if (!html.includes("apple-mobile-web-app-capable")) {
  html = html.replace("</head>", tags + "</head>");
}

// Idioma correto
html = html.replace('<html lang="en">', '<html lang="pt-BR">');

fs.writeFileSync(arquivo, html);
console.log("inject-pwa: meta tags de PWA injetadas em dist/index.html ✔");
