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

Your Markdown files need frontmatter (YAML metadata) at the top. Here's what you can include:

### Required Fields

```yaml
---
title: "Your Post Title"
tags: ["tag1", "tag2", "tag3"]
---
```

### Complete Example with All Options

```markdown
---
title: "Getting Started with GitHub Actions"
subtitle: "Automate your development workflow"
tags: ["github", "automation", "ci-cd", "tutorial"]
publishedAt: "2024-08-20T10:00:00.000Z"
slug: "getting-started-github-actions"
metaDescription: "Learn how to automate your development workflow with GitHub Actions in this comprehensive beginner's guide."
coverImage: "https://example.com/cover-image.jpg"
canonicalUrl: "https://yourblog.com/original-post"
seriesId: "github-actions-series"
coAuthors: ["devops-expert", "automation-guru"]
disableComments: false
enableTableOfContents: true
isDraft: false
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

### All Supported Metadata Fields

#### Required Fields

- **title**: Your post title (required)
- **tags**: Array of tags for your post (required, max 5 recommended)

#### Basic Content Fields

- **subtitle**: Optional subtitle that appears under the title
- **publishedAt**: Specific publication date and time
  - ISO 8601 format: `"2024-08-15T10:30:00.000Z"`
  - Simple date: `"2024-08-15"` (defaults to midnight UTC)
  - If not specified, uses current time for public posts
- **isDraft**: Set to `true` to publish as draft (overrides action's `post_status`)

#### SEO and URL Control

- **slug**: Custom URL slug for your post (letters, numbers, hyphens only)
- **metaDescription**: Custom SEO meta description (160 chars recommended)
- **canonicalUrl**: Original source URL if republishing from another platform

#### Visual Elements

- **coverImage**: URL to a cover image for your post
- **coverImageOptions**: Alternative way to specify cover image
  ```yaml
  coverImageOptions:
    coverImageURL: "https://example.com/image.jpg"
  ```
- **enableTableOfContents**: Boolean to show/hide table of contents

#### Content Organization

- **seriesId**: ID of an existing series to add this post to
- **coAuthors**: Array of usernames for co-authored posts
- **disableComments**: Boolean to disable comments on the post

#### Republishing Support

- **isRepublished**: For content originally published elsewhere
  ```yaml
  isRepublished:
    originalArticleURL: "https://original-site.com/post"
  ```

#### Auto-Generated Fields (Don't Set Manually)

- **publishedUrl**: Added automatically after publishing

## Real-World Examples

### Basic Blog Post

```yaml
---
title: "10 JavaScript Tips Every Developer Should Know"
tags: ["javascript", "web-development", "tips"]
---
```

### Comprehensive Tutorial with All Features

```yaml
---
title: "Complete Docker Guide for Developers"
subtitle: "From beginner to production-ready containers"
tags: ["docker", "containers", "devops", "tutorial"]
publishedAt: "2024-08-20T09:00:00.000Z"
slug: "complete-docker-guide-developers"
metaDescription: "Master Docker with this comprehensive guide covering everything from basics to production deployments."
coverImage: "https://cdn.hashnode.com/res/hashnode/image/upload/v1234567890/docker-guide.png"
seriesId: "docker-mastery-series"
coAuthors: ["docker-expert"]
enableTableOfContents: true
disableComments: false
---
```

### Republished Content from Another Platform

```yaml
---
title: "Migrating from Medium to Hashnode"
tags: ["blogging", "migration", "hashnode"]
canonicalUrl: "https://medium.com/@username/migrating-from-medium"
isRepublished:
  originalArticleURL: "https://medium.com/@username/migrating-from-medium"
---
```

### Draft Post for Review

```yaml
---
title: "Work in Progress: Advanced React Patterns"
tags: ["react", "javascript", "patterns"]
isDraft: true
---
```

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
      - uses: kodelint/publish-to-hashnode@v1.1.0.1.0.1.0
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
name: Publish Tutorial Series

on:
  push:
    branches: [main]
    paths: ["tutorials/**/*.md"]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: kodelint/publish-to-hashnode@v1.1.0
        with:
          src: "./tutorials"
          hashnode_pat: ${{ secrets.HASHNODE_PAT }}
          publication_id: ${{ secrets.HASHNODE_PUBLICATION_ID }}
```

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

### Tags

```yaml
# ✅ Good tags
tags: ["javascript", "web-development", "tutorial", "beginners"]

# ❌ Avoid these
tags: ["JavaScript", "Web Development", "Tutorial!!!", "js/ts"]
```

- Use lowercase
- Use hyphens instead of spaces
- Keep to 3-5 tags per post
- Be specific and relevant

### Custom Slugs

```yaml
# ✅ Good slugs
slug: "advanced-react-patterns"
slug: "docker-compose-tutorial-2024"

# ❌ Avoid these
slug: "Advanced React Patterns!!!"
slug: "docker_compose tutorial"
```

- Use only letters, numbers, and hyphens
- Keep under 100 characters
- Make them descriptive and SEO-friendly

### Publication Dates

```yaml
# ✅ Recommended formats
publishedAt: "2024-08-20T10:00:00.000Z"    # Full ISO format
publishedAt: "2024-08-20"                   # Simple date
publishedAt: "2024-08-20T14:30:00-05:00"   # With timezone

# ❌ Avoid these
publishedAt: "August 20th, 2024"           # Ambiguous format
publishedAt: "2024/08/20"                  # Wrong separator
```

### Cover Images

- Use high-quality images (1600x840px recommended)
- Ensure images are publicly accessible
- Consider using Hashnode's CDN for better performance
- Include alt text in your post content

### SEO Optimization

```yaml
title: "Complete Guide to Docker for Developers" # Clear, descriptive
metaDescription: "Learn Docker from basics to production deployment with practical examples and best practices." # Under 160 chars
slug: "complete-docker-guide-developers" # SEO-friendly URL
```

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

**"Missing or invalid metadata"**

- Ensure `title` and `tags` are present in frontmatter
- Tags must be an array: `tags: ["tag1", "tag2"]`
- Check YAML syntax with a validator

**"Invalid date format"**

- Use ISO 8601 format: `"2024-08-20T10:00:00.000Z"`
- Or simple date: `"2024-08-20"`
- Always use quotes around dates

**"Could not extract post ID from URL"**

- The `publishedUrl` in frontmatter may be malformed
- Action will create a new post instead of updating
- Remove `publishedUrl` to force new post creation

**"API request failed: 401"**

- Check your Hashnode Personal Access Token
- Ensure token has publishing permissions
- Verify token is stored correctly in GitHub Secrets

**"Publication not found"**

- Verify your `publication_id` is correct
- Check you have publishing rights to the publication

### Getting Help

If you encounter issues:

1. Check the action logs in your GitHub Actions tab
2. Verify your Hashnode PAT has the correct permissions
3. Ensure your publication ID is correct
4. [Open an issue](https://github.com/kodelint/publish-to-hashnode/issues) with details

## Advanced Features

### Working with Series

To add posts to a series, you need the series ID from Hashnode:

1. Go to your Hashnode dashboard
2. Navigate to your series
3. Copy the series ID from the URL or settings
4. Add it to your post frontmatter:

```yaml
---
title: "Part 3: Advanced Docker Networking"
seriesId: "docker-mastery-series-id"
tags: ["docker", "networking", "containers"]
---
```

### Co-Authoring Posts

For collaborative posts, add co-author usernames:

```yaml
---
title: "Building Microservices: A Team Perspective"
coAuthors: ["backend-expert", "frontend-guru"]
tags: ["microservices", "architecture", "collaboration"]
---
```

### SEO Optimization

Maximize your post's discoverability:

```yaml
---
title: "Complete Kubernetes Tutorial for Beginners"
metaDescription: "Learn Kubernetes from scratch with hands-on examples, deployments, and production best practices."
slug: "kubernetes-tutorial-beginners-2024"
tags: ["kubernetes", "devops", "tutorial", "beginners"]
enableTableOfContents: true
---
```

### Content Migration

When migrating from other platforms, preserve SEO value:

```yaml
---
title: "My Journey from Medium to Hashnode"
canonicalUrl: "https://medium.com/@username/migration-story"
isRepublished:
  originalArticleURL: "https://medium.com/@username/migration-story"
tags: ["blogging", "migration", "writing"]
---
```

### Scheduled Publishing

While the action doesn't directly support scheduling, you can:

1. Set future dates in `publishedAt`
2. Use GitHub's scheduled workflows
3. Store posts as drafts until ready

```yaml
# In your workflow
on:
  schedule:
    - cron: "0 9 * * 1" # Every Monday at 9 AM

# In your post
---
title: "Weekly Update: What's New in Tech"
publishedAt: "2024-08-26T09:00:00.000Z" # Next Monday
isDraft: false
---
```

## Advanced Usage Patterns

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

---

_Automate your blogging workflow and focus on writing great content!_
