/**
 * Static Site Generator for Ink Over Silence blog
 * 
 * This modular implementation separates concerns into:
 * - Cache management
 * - File rendering
 * - Template generation
 * - Site building
 * 
 * Using modern ESM modules and async/await patterns
 */

import { promises as fs } from 'fs';
import { existsSync, statSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { marked } from 'marked';
import matter from 'front-matter';
import chalk from 'chalk';


// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  contentDir: path.join(__dirname, "content"),
  outputDir: process.cwd(),
  cacheFile: path.join(__dirname, "content", ".cache.json"),
  categories: ["tech", "articles", "thoughts"]
};

// Enhanced aesthetic logger for your blog
const logger = {
  // Core actions
  build: (message) => console.log(`${chalk.hex('#FFA500').bold('⟳')} ${chalk.hex('#FFA500')(message)}`),
  success: (message) => console.log(`${chalk.hex('#50C878').bold('✓')} ${chalk.hex('#50C878')(message)}`),
  error: (message) => console.log(`${chalk.hex('#FF6B6B').bold('✗')} ${chalk.hex('#FF6B6B')(message)}`),

  // Content types
  poetry: (message) => console.log(`${chalk.hex('#E6E6FA').bold('✒')} ${chalk.hex('#E6E6FA')(message)}`),
  article: (message) => console.log(`${chalk.hex('#89CFF0').bold('📝')} ${chalk.hex('#89CFF0')(message)}`),
  thought: (message) => console.log(`${chalk.hex('#98FB98').bold('💭')} ${chalk.hex('#98FB98')(message)}`),

  // File operations
  created: (message) => console.log(`${chalk.hex('#77DD77').bold('＋')} ${chalk.hex('#77DD77')(message)}`),
  updated: (message) => console.log(`${chalk.hex('#FFD700').bold('✎')} ${chalk.hex('#FFD700')(message)}`),
  cached: (message) => console.log(`${chalk.hex('#AEC6CF').bold('💾')} ${chalk.hex('#AEC6CF')(message)}`),
  deleted: (message) => console.log(`${chalk.hex('#FF6961').bold('✖')} ${chalk.hex('#FF6961')(message)}`),

  // Special formats
  divider: () => console.log(chalk.hex('#6A5ACD').bold('━'.repeat(50))),
  header: (message) => {
    logger.divider();
    console.log(`${chalk.hex('#9370DB').bold(` ${message}`)}`);
    logger.divider();
  }
};

// Cache Manager
const cacheManager = (() => {

  let cache = {};
  const loadCache = async () => {
    try {
      if (existsSync(config.cacheFile)) {
        const data = await fs.readFile(config.cacheFile, "utf-8");
        cache = JSON.parse(data);
        return cache;
      }
      return {};
    } catch (error) {
      logger.error("Error loading cache:", error);
      return {};
    }
  };

  const isModified = (filePath) => {
    const stats = statSync(filePath);
    const lastModified = stats.mtimeMs;
    const cachedModified = cache[filePath];
    return !cachedModified || lastModified > cachedModified;
  };

  const updateCache = (filePath) => {
    const stats = statSync(filePath);
    cache[filePath] = stats.mtimeMs;
  };

  const saveCache = async () => {
    try {
      await fs.writeFile(config.cacheFile, JSON.stringify(cache, null, 2));
    } catch (error) {
      logger.error("Error saving cache:", error);
    }
  };

  return {
    loadCache,
    isModified,
    updateCache,
    saveCache
  };
})();

// Templates
const templates = {
  getPageLayout: (title, content, additionalScripts = "") => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title ? `${title} | ` : ""}Ink Over Silence</title>
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
    ${content}
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
  ${additionalScripts}
</body>
</html>`;
  },

  getArticleLayout: (title, date, content, isPoetry) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="../assets/css/blog.css" rel="stylesheet">
  <style>
    .poetry-container {
      background-image: url('assets/images/paper-texture-light-note.jpg') center/cover;
    }
    .dark-mode .poetry-container {
      background-image: url('assets/images/paper-texture-light-note.jpg') center/cover;
    }
  </style>
</head>
<body class="${isPoetry ? 'has-poetry' : ''}">
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
      <h1>${title}</h1>
      <p class="post-date">${date}</p>
      ${content}
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
</html>`;
  },

  getHomepageHeader: () => {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ink Over Silence</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/css/main.css" rel="stylesheet">
    <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167x167.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
    <link rel="apple-touch-icon" sizes="1024x1024" href="/apple-touch-icon-1024x1024.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
    <link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png">
    <link rel="icon" type="image/png" sizes="128x128" href="/favicon-128x128.png">
    <link rel="icon" type="image/png" sizes="256x256" href="/favicon-256x256.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="msapplication-TileImage" content="/mstile-144x144.png">
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

    <main class="container">`;
  },

  getHomepageFooter: () => {
    return `  </main>
    <footer class="text-muted py-5 text-center">
      <div class="container">
        <p>&copy; 2025 Ink Over Silence — Breathe. Reflect. Write.</p>
      </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>`;
  },

  getCategorySection: (category, postLinks) => {
    return `<section class="mb-5">
  <h2 class="border-bottom pb-2">${capitalize(category)}</h2>
  <div class="list-group">
    ${postLinks.join('\n')}
  </div>
</section>`;
  },

  getPostLink: (category, slug, title, date, abstract) => {
    return `<a href="${category}/${slug}.html" class="list-group-item list-group-item-action">
  <div class="d-flex w-100 justify-content-between">
    <h5 class="mb-1">${title}</h5>
    <small>${date}</small>
  </div>
  <p class="mb-1">${abstract}</p>
</a>`;
  }
};

// Content Renderer
const contentRenderer = {
  renderMarkdown: (content, isPoetry) => {
    if (isPoetry) {
      // Add poetry-specific wrapper and preserve line breaks
      return `
      <div class="poetry-container">   
        <div class="poetry-paper">
          <p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>
        </div>
      </div>
      `;
    } else {
      return marked.parse(content);
    }
  },

  renderArticle: async (filePath, outputPath) => {
    try {
      const mdContent = await fs.readFile(filePath, "utf-8");
      const { attributes, body } = matter(mdContent);
      const isPoetry = attributes.type === "poetry";

      const htmlContent = contentRenderer.renderMarkdown(body, isPoetry);
      const articleHTML = templates.getArticleLayout(
        attributes.title,
        attributes.date,
        htmlContent,
        isPoetry
      );

      await fs.writeFile(outputPath, articleHTML, "utf-8");
      return attributes;
    } catch (error) {
      logger.error(`Error rendering article ${filePath}:`, error);
      throw error;
    }
  }
};

// Static Pages Builder
const staticPagesBuilder = {
  pages: [
    {
      filename: "about.html",
      title: "About",
      content: `
      <article class="content">
        <h1>About</h1>
        <p>Hello. I'm glad you're here.</p>
        <p> This blog is my quiet corner of the internet, a place to pause, reflect, and write without filters.It's where
          thoughts become words, code meets poetry, and stories find their shape.</p>

        <p>I'm a developer by profession and a thinker by compulsion. Much of my work involves bridging engineering with
            expression-building tools, solving problems, and sometimes just staring into space until something clicks. I
            write not because I have answers, but because I have questions that refuse to stay silent.</p>

        <p><em>Ink Over Silence</em> is a collection of reflections -- from tech deep-dives and design musings to
            #showerthoughts and poetry that comes uninvited. Some pieces may be precise, others meander. But each one is
            honest.</p>

        <p>If you've ever felt like you don't quite fit into a single box, or if you've ever looked at life and thought
            "there's more to this," you might find something familiar here.</p>

        <p>Thanks for reading. You're always welcome back.</p>
        <p><em>—Madhukar</em></p>
        <p class="mt-4">P.S. If you want to connect, check out the <a href="contact.html">Contact</a> page.</p>
      </article>`
    },
    {
      filename: "contact.html",
      title: "Contact",
      content: `
      <article class="content">
        <h1>Contact</h1>
        <section>
          <h2>Let's Connect</h2>
          <p>If something here spoke to you, don't hesitate to reach out!.</p>
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
      </article>`,
      additionalScripts: `
      <script>
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
  ],

  buildStaticPages: async () => {
    try {
      const writePromises = staticPagesBuilder.pages.map(async ({ filename, title, content, additionalScripts = "" }) => {
        const html = templates.getPageLayout(title, content, additionalScripts);
        await fs.writeFile(path.join(config.outputDir, filename), html, "utf-8");
        logger.build(`Generated static page: ${filename}`);
      });

      await Promise.all(writePromises);
    } catch (error) {
      logger.error("Error building static pages:", error);
      throw error;
    }
  }
};

// Site Builder
const siteBuilder = {
  buildHomepage: async (categoryData) => {
    try {
      let content = '';

      Object.entries(categoryData).forEach(([category, posts]) => {
        if (posts.length > 0) {
          const postLinks = posts.map(post => {
            return templates.getPostLink(
              category,
              post.slug,
              post.title,
              post.date,
              post.abstract
            );
          });

          content += templates.getCategorySection(category, postLinks);
        }
      });

      const homepageContent = templates.getHomepageHeader() + content + templates.getHomepageFooter();
      await fs.writeFile(path.join(config.outputDir, "index.html"), homepageContent, "utf-8");
      logger.success("Homepage built successfully");
    } catch (error) {
      logger.error("Error building homepage:", error);
      throw error;
    }
  },

  processCategory: async (category) => {
    try {
      const inputFolder = path.join(config.contentDir, category);
      const outputFolder = path.join(config.outputDir, category);

      if (!existsSync(outputFolder)) {
        await fs.mkdir(outputFolder, { recursive: true });
      }

      const files = (await fs.readdir(inputFolder))
        .filter(file => file.endsWith(".md"));

      const posts = [];

      // Process files in parallel
      const processPromises = files.map(async (file) => {
        const filePath = path.join(inputFolder, file);
        const slug = path.basename(file, ".md");
        const outputPath = path.join(outputFolder, slug + ".html");

        if (cacheManager.isModified(filePath)) {
          logger.build(`Rendering ${filePath}...`);
          const attributes = await contentRenderer.renderArticle(filePath, outputPath);
          cacheManager.updateCache(filePath);

          return {
            slug,
            title: attributes.title,
            date: attributes.date,
            abstract: attributes.abstract
          };
        } else {
          // Read just the front matter for unchanged files
          const mdContent = readFileSync(filePath, "utf-8");
          const { attributes } = matter(mdContent);

          return {
            slug,
            title: attributes.title,
            date: attributes.date,
            abstract: attributes.abstract
          };
        }
      });

      const results = await Promise.all(processPromises);
      return results;
    } catch (error) {
      logger.error(`Error processing category ${category}:`, error);
      throw error;
    }
  },

  buildSite: async () => {
    logger.build("Building site...");
    try {
      await cacheManager.loadCache();

      const categoryData = {};
      const categoryPromises = config.categories.map(async (category) => {
        logger.build(`Processing category: ${category}`);
        categoryData[category] = await siteBuilder.processCategory(category);
      });

      await Promise.all(categoryPromises);

      logger.build("Building homepage...");
      await siteBuilder.buildHomepage(categoryData);

      logger.build("Building static pages...");
      await staticPagesBuilder.buildStaticPages();

      await cacheManager.saveCache();
      logger.success("Site built successfully!");
    } catch (error) {
      logger.error("Failed to build site:", error);
      process.exit(1);
    }
  }
};

// Helper functions
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Execute the build
(async () => {
  try {
    await siteBuilder.buildSite();
  } catch (error) {
    logger.error("Build failed:", error);
    process.exit(1);
  }
})();

// Export for testing or programmatic usage
export {
  siteBuilder,
  config,
  contentRenderer,
  templates,
  cacheManager
};