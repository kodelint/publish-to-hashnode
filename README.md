# Hashnode Publisher 📝

A GitHub Action that automatically publishes your Markdown blog posts to Hashnode. Simply commit your posts to your repository and let the action handle the publishing process.

## Features

- ✅ Publishes Markdown files to your Hashnode publication
- 🔄 Updates existing posts when you modify them
- 🏷️ Automatically handles tags and metadata
- 📊 Provides detailed logging and error reporting
- 🎯 Supports both draft and public publishing
- 🖼️ Handles cover images and canonical URLs

## Quick Start

### 1. Get Your Hashnode Credentials

Before using this action, you'll need:

- **Personal Access Token**: Go to [Hashnode Settings](https://hashnode.com/settings/developer) → API → Generate new token
- **Publication ID**: In your Hashnode dashboard, go to your publication settings. The ID is in the URL or settings page

### 2. Store Your Token as a Secret

In your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `HASHNODE_PAT`
4. Value: Your Hashnode Personal Access Token

### 3. Create Your Workflow

Create `.github/workflows/publish-to-hashnode.yml`:

```yaml
name: Publish to Hashnode

on:
  push:
    branches: [main]
    paths: ["posts/**/*.md"] # Only run when markdown files in posts/ change

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Publish to Hashnode
        uses: kodelint/publish-to-hashnode@v1
        with:
          src: "./posts"
          hashnode_pat: ${{ secrets.HASHNODE_PAT }}
          publication_id: "your-publication-id-here"
          post_status: "public"
          update_existing_posts: "true"
```

## Configuration Options

| Input                   | Description                              | Required | Default  |
| ----------------------- | ---------------------------------------- | -------- | -------- |
| `src`                   | Directory containing your Markdown files | ✅ Yes   |          |
| `hashnode_pat`          | Your Hashnode Personal Access Token      | ✅ Yes   |          |
| `publication_id`        | Your Hashnode publication ID             | ✅ Yes   |          |
| `post_status`           | Post visibility: `public` or `draft`     | No       | `public` |
| `update_existing_posts` | Update posts that already exist          | No       | `false`  |

## Writing Your Posts

Your Markdown files need frontmatter (YAML metadata) at the top. Here's what you need:

### Required Fields

```yaml
---
title: "Your Post Title"
tags: ["tag1", "tag2", "tag3"]
---
```

### Complete Example

```markdown
---
title: "Getting Started with GitHub Actions"
subtitle: "Automate your development workflow"
tags: ["github", "automation", "ci-cd", "tutorial"]
coverImage: "https://example.com/cover-image.jpg"
canonicalUrl: "https://yourblog.com/original-post"
---

# Getting Started with GitHub Actions

GitHub Actions is a powerful automation platform that can help you build, test, and deploy your code right from GitHub.

## What You'll Learn

In this tutorial, we'll cover:

- Setting up your first workflow
- Understanding YAML syntax
- Using community actions
- Best practices for CI/CD

Let's dive in!
```

### Field Descriptions

- **title**: Your post title (required)
- **subtitle**: Optional subtitle that appears under the title
- **tags**: Array of tags for your post (required, max 5 tags recommended)
- **coverImage**: URL to a cover image for your post
- **canonicalUrl**: If republishing from another site, link to the original
- **publishedUrl**: Added automatically after publishing (don't add this manually)

## Example Workflows

### Basic Setup

```yaml
name: Publish New Posts

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: kodelint/publish-to-hashnode@v1
        with:
          src: "./blog"
          hashnode_pat: ${{ secrets.HASHNODE_PAT }}
          publication_id: ${{ secrets.HASHNODE_PUBLICATION_ID }}
```

### Publish as Drafts First

```yaml
name: Draft Posts for Review

on:
  pull_request:
    paths: ["content/**/*.md"]

jobs:
  draft:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: kodelint/publish-to-hashnode@v1
        with:
          src: "./content"
          hashnode_pat: ${{ secrets.HASHNODE_PAT }}
          publication_id: ${{ secrets.HASHNODE_PUBLICATION_ID }}
          post_status: "draft"
```

### Conditional Publishing

```yaml
name: Smart Publishing

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2 # Get previous commit for comparison

      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v39
        with:
          files: |
            posts/**/*.md

      - name: Publish changed posts
        if: steps.changed-files.outputs.any_changed == 'true'
        uses: kodelint/publish-to-hashnode@v1
        with:
          src: "./posts"
          hashnode_pat: ${{ secrets.HASHNODE_PAT }}
          publication_id: ${{ secrets.HASHNODE_PUBLICATION_ID }}
          update_existing_posts: "true"
```

## Repository Structure

Here's how you might organize your blog repository:

```
your-blog-repo/
├── .github/
│   └── workflows/
│       └── publish-to-hashnode.yml
├── posts/
│   ├── 2024-01-15-getting-started.md
│   ├── 2024-02-01-advanced-tips.md
│   └── 2024-02-15-best-practices.md
├── images/
│   ├── cover-1.jpg
│   └── cover-2.jpg
└── README.md
```

## Troubleshooting

### Common Issues

**"No markdown files found"**

- Check your `src` path is correct
- Ensure files have `.md` or `.markdown` extensions

**"Missing required 'title' field"**

- Add a title in your frontmatter: `title: "Your Title"`

**"Invalid tags"**

- Tags must be an array: `tags: ["tag1", "tag2"]`
- Each tag should be a string

**"Could not extract post ID from URL"**

- This happens when `publishedUrl` in frontmatter is malformed
- The action will create a new post instead of updating

### Getting Help

If you encounter issues:

1. Check the action logs in your GitHub Actions tab
2. Verify your Hashnode PAT has the correct permissions
3. Ensure your publication ID is correct
4. [Open an issue](https://github.com/kodelint/publish-to-hashnode/issues) with details

## Advanced Usage

### Multiple Publications

You can publish to different publications based on conditions:

```yaml
- name: Publish to Tech Blog
  if: contains(github.event.head_commit.message, '[tech]')
  uses: kodelint/publish-to-hashnode@v1
  with:
    src: "./posts"
    hashnode_pat: ${{ secrets.HASHNODE_PAT }}
    publication_id: ${{ secrets.TECH_PUBLICATION_ID }}

- name: Publish to Personal Blog
  if: contains(github.event.head_commit.message, '[personal]')
  uses: kodelint/publish-to-hashnode@v1
  with:
    src: "./posts"
    hashnode_pat: ${{ secrets.HASHNODE_PAT }}
    publication_id: ${{ secrets.PERSONAL_PUBLICATION_ID }}
```

### Scheduled Publishing

Publish posts on a schedule:

```yaml
on:
  schedule:
    - cron: "0 9 * * 1" # Every Monday at 9 AM UTC

jobs:
  scheduled-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: kodelint/publish-to-hashnode@v1
        with:
          src: "./scheduled-posts"
          hashnode_pat: ${{ secrets.HASHNODE_PAT }}
          publication_id: ${{ secrets.HASHNODE_PUBLICATION_ID }}
```

## Contributing

Found a bug or want to contribute? Check out our [contribution guidelines](CONTRIBUTING.md) and feel free to open issues or pull requests.

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [kodelint](https://github.com/kodelint)**

_Automate your blogging workflow and focus on writing great content!_
