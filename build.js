const fs = require("fs");
const path = require("path");
const marked = require("marked");
const matter = require("front-matter");
const { cwd } = require("process");

const contentDir = "./content";
const outputDir = process.cwd();

const categories = ["tech", "articles", "thoughts"];

function buildSite() {
  let indexContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ink Over Silence</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/main.css" rel="stylesheet">
  </head>
  <body>
    <header class="border-bottom py-3 mb-4">
      <div class="container d-flex flex-wrap justify-content-between">
        <h1 class="fs-3">Ink Over Silence</h1>
        <nav>
          <a href="index.html" class="nav-link px-2 link-dark">Home</a>
        </nav>
      </div>
    </header>

    <main class="container">
`;

  categories.forEach((category) => {
    const inputFolder = path.join(contentDir, category);
    const outputFolder = path.join(outputDir, category);
    if (!fs.existsSync(outputFolder))
      fs.mkdirSync(outputFolder, { recursive: true });

    indexContent += `<section class="mb-5"><h2 class="border-bottom pb-2">${capitalize(category)}</h2>\n<div class="list-group">\n`;

    const files = fs
      .readdirSync(inputFolder)
      .filter((file) => file.endsWith(".md"));

    files.forEach((file) => {
      const filePath = path.join(inputFolder, file);
      const mdContent = fs.readFileSync(filePath, "utf-8");
      const { attributes, body } = matter(mdContent);

      const slug = path.basename(file, ".md");
      const htmlContent = marked.parse(body);

      const articleHTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${attributes.title}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="../assets/css/blog.css" rel="stylesheet">
  </head>
  <body>
    <header class="border-bottom py-3 mb-4">
      <div class="container d-flex flex-wrap justify-content-between align-items-center">
        <h1 class="fs-3 m-0"><a href="../index.html" class="site-title">Ink Over Silence</a></h1>
        <button class="dark-mode-toggle" aria-label="Toggle dark mode">
          <i class="fas fa-moon"></i>
        </button>
      </div>
    </header>

    <main class="container">
      <article class="blog-post">
        <h1>${attributes.title}</h1>
        <p class="post-date">${attributes.date}</p>
        ${htmlContent}
      </article>
    </main>

    <footer class="py-5 text-center">
      <div class="container">
        <p class="footer-text">&copy; 2025 Ink Over Silence — Keep writing, keep breathing.</p>
      </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const toggleBtn = document.querySelector('.dark-mode-toggle');
        const icon = toggleBtn.querySelector('i');
        
        // Initialize
        const storedMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialMode = storedMode ? storedMode === 'true' : prefersDark;
        
        if (initialMode) {
          document.body.classList.add('dark-mode');
          icon.classList.replace('fa-moon', 'fa-sun');
        }
        
        // Toggle handler
        toggleBtn.addEventListener('click', () => {
          document.body.classList.toggle('dark-mode');
          const isDark = document.body.classList.contains('dark-mode');
          localStorage.setItem('darkMode', isDark);
          icon.classList.toggle('fa-sun', isDark);
          icon.classList.toggle('fa-moon', !isDark);
        });
      });
    </script>
  </body>
</html>
`;

      const outputPath = path.join(outputFolder, slug + ".html");
      fs.writeFileSync(outputPath, articleHTML, "utf-8");
      indexContent += `<a href="${category}/${slug}.html" class="list-group-item list-group-item-action">
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${attributes.title}</h5>
        <small>${attributes.date}</small>
      </div>
      <p class="mb-1">${attributes.abstract}</p>
    </a>\n`;
    });
    indexContent += `</div></section>\n`;
  });

  indexContent += ` </main>
    <footer class="text-muted py-5 text-center">
      <div class="container">
        <p>&copy; 2025 Ink Over Silence — Breathe. Reflect. Write.</p>
      </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  </body></html>`;
  fs.writeFileSync(path.join(outputDir, "index.html"), indexContent, "utf-8");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

buildSite();
