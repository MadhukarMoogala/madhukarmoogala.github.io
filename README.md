# 📝 Ink Over Silence

Welcome to my personal blog — a space where thoughts find form, code meets reflection, and stories breathe. This is a lightweight, custom-built static blog powered by Node.js.

---

## 📁 Project Structure

        📁 .vscode/ — ⚙️ Editor settings (optional)</br>
        📄 README.md — 📘 Project documentation</br>
        📁 articles/ — 📰 Processed HTML articles</br>
        📁 assets/ — 🎨 Static assets (CSS, fonts, images)</br>
        📄 build.js — 🛠️ Build script to generate static html from marked files</br>
        📁 content/ — ✍️ Markdown blog posts with resp folder</br>
        📄 index.html — 🏠 Homepage entry point</br>
        📄 package.json — 📦 Project metadata and dependencies</br>
        📄 package-lock.json — 🔐 Dependency lockfile</br>

---

## 🚀 Getting Started

### 1. Clone & Install dependencies

```bash
git clone 
npm install
```

### 2. Build the site

This command reads the content from content/, processes it, and outputs the site to public/.

```bash
node build.js
```

### 3. Serve locally (optional)

If you want to preview the blog locally, you can use any static server:

```bash
npx serve publ
```

---

## ✍️ Writing Posts

Add your blog posts as Markdown files inside the `content/` directory. The `build.js` script will parse these and generate the corresponding HTML pages.

Each post can optionally include frontmatter for metadata like this:

```markdown
---
title: "Why I Write"
date: "2025-05-01"
tags: [reflection, writing]
abstract: "A personal note on why I chose to start this blog."
---
```

---

## 🎨 Styling

The blog is styled with a minimalist aesthetic inspired by *The Financial Times*, using:

- A soft, readable background

- Elegant serif fonts (e.g., Merriweather, Playfair Display)

- Subtle typographic enhancements

You can customize styles in `public/blog.css`.

---

## 📦 Dependencies

This project can be extended using:

- [`marked`](https://www.npmjs.com/package/marked) — Markdown parser

- [`fs-extra`](https://www.npmjs.com/package/fs-extra) — File system utilities

- [`gray-matter`](https://www.npmjs.com/package/gray-matter) — For parsing frontmatter

These are examples — your actual dependencies may differ depending on your implementation.

---

## 🧠 Philosophy

This blog is intentionally minimalist — no trackers, no bloat, just words and ideas. It’s built to reflect, to share, and to stay honest.

---

## 📄 License

MIT License © 2025 Madhukar Moogala
