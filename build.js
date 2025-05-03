const fs = require("fs");
const path = require("path");
const marked = require("marked");
const matter = require("front-matter");
const { cwd } = require("process");

const contentDir = "./content";
const outputDir = process.cwd();

const categories = ["tech", "articles", "thoughts"];

const staticPages = [
  {
    filename: "about.html",
    title: "About",
    content: `
    <p>Hello. I’m glad you’re here.</p>
      <p> This blog is my quiet corner of the internet, a place to pause, reflect, and write without filters.It’s where
        thoughts become words, code meets poetry, and stories find their shape.</p>

    <p>I’m a developer by profession and a thinker by compulsion. Much of my work involves bridging engineering with
        expression-building tools, solving problems, and sometimes just staring into space until something clicks. I
        write not because I have answers, but because I have questions that refuse to stay silent.</p>

    <p><em>Ink Over Silence</em> is a collection of reflections -- from tech deep-dives and design musings to
        #showerthoughts and poetry that comes uninvited. Some pieces may be precise, others meander. But each one is
        honest.</p>

    <p>If you’ve ever felt like you don’t quite fit into a single box, or if you’ve ever looked at life and thought
        “there’s more to this,” you might find something familiar here.</p>

    <p>Thanks for reading. You’re always welcome back.</p>`
  },
  {
    filename: "contact.html",
    title: "",
    content: `
    <main class="container">
        <section>
            <h2>Let’s Connect</h2>
            <p>If something here spoke to you, don’t hesitate to reach out!.</p>
            <ul class="contact-list mb-4">
                <li><i data-feather="mail"></i><a href="mailto:madhukarmoogala@gmail.com"> Hello!</a>
                </li>
                <li><i data-feather="github"></i><a href="https://github.com/madhukarmoogala" target="_blank"
                        rel="noopener"> What I Do ?</a></li>
                <li><i data-feather="linkedin"></i><a href="https://linkedin.com/in/madhukarmoogala" target="_blank"
                        rel="noopener"> Who am I ?</a></li>
            </ul>

            <div class="contact-form">
                <form id="contactForm">
                    <label for="message" class="form-label"><strong>Your Message</strong></label>
                    <textarea id="message" name="message" class="form-control" rows="6"
                        placeholder="What would you like to say?"></textarea>
                    <button type="submit" class="btn btn-primary mt-3">Send via Email</button>
                </form>
            </div>

            <p class="mt-4"><em>—Madhukar</em></p>
        </section>
    </main>     
    <script>
        feather.replace();

        // Redirecting form to mailto and back to index.html
        document.getElementById('contactForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const message = document.getElementById('message').value;
            const mailtoLink = "mailto:madhukarmoogala@gmail.com?subject=Message from Ink Over Silence&body=" + encodeURIComponent(message);
            window.location.href = mailtoLink;

            // Optionally redirect after 2 sec
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        });
    </script>`
  }
];

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
    <div class="container d-flex flex-wrap justify-content-between align-items-center">
      <h1 class="fs-3 m-0">Ink Over Silence</h1>
      <nav class="nav">
        <a href="index.html" class="nav-link px-2 link-dark">Home</a>
        <a href="about.html" class="nav-link px-2 link-dark">About</a>
        <a href="contact.html" class="nav-link px-2 link-dark">Contact</a>
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

      const articleHTML = `<!DOCTYPE html>
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

  staticPages.forEach(({ filename, title, content }) => {
    const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title} | Ink Over Silence</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <link href="assets/css/blog.css" rel="stylesheet">
    </head>
    <body>
      <header class="border-bottom py-3 mb-4">
        <div class="container d-flex flex-wrap justify-content-between align-items-center">
          <h1 class="fs-3 m-0"><a href="index.html" class="site-title">Ink Over Silence</a></h1>
          <button class="dark-mode-toggle" aria-label="Toggle dark mode">
            <i class="fas fa-moon"></i>
          </button>
        </div>
      </header>
  
      <main class="container">
        <article class="content">
          <h1>${title}</h1>
          ${content}
        </article>
      </main>
  
      <footer class="py-5 text-center">
        <div class="container">
          <p class="footer-text">&copy; 2025 Ink Over Silence — Keep writing, keep breathing.</p>
        </div>
      </footer>
  
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
      <script src="https://unpkg.com/feather-icons"></script>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          feather.replace();
          
          const toggleBtn = document.querySelector('.dark-mode-toggle');
          const icon = toggleBtn.querySelector('i');
          
          // Initialize dark mode
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
  </html>`;

    fs.writeFileSync(path.join(outputDir, filename), html, "utf-8");
  });
  console.log("Site built successfully!");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

buildSite();
