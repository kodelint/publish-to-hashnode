# Hashnode Publisher 📝

A GitHub Action to automate publishing Markdown blog posts to Hashnode. This action reads Markdown files, extracts metadata from the front matter, and publishes the content to your Hashnode publication.

## 🚀 Usage

Here is a complete workflow example to get you started. This workflow runs on a `push` to the `main` branch, publishing any new or updated blog posts from the `posts/` directory.

### Prerequisites

- **Hashnode Personal Access Token:** You need a Hashnode Personal Access Token (PAT). You can generate one from your [Hashnode dashboard](https://hashnode.com/settings/pat).
- **Publication ID:** Find your publication ID in your Hashnode dashboard.
- **GitHub Secret:** Store your Hashnode PAT as a GitHub Secret in your repository settings (e.g., named `HASHNODE_PAT`).

### Example Workflow (`.github/workflows/publish.yml`)

```yaml
name: Publish to Hashnode

on:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Publish posts to Hashnode
        id: hashnode-publisher
        uses: kodelint/hashnode-publisher@v1 # Replace with your action's repository and tag
        with:
          src: "./posts"
          hashnode_pat: ${{ secrets.HASHNODE_PAT }}
          publication_id: "your-publication-id" # Replace with your publication ID
          post_status: "public"
          update_existing_posts: "true"
```

## ⚙️ Inputs

| Name                    | Description                                                              | Required | Default  |
| ----------------------- | ------------------------------------------------------------------------ | -------- | -------- |
| `src`                   | The path to the directory containing the Markdown blog posts.            | `true`   |          |
| `hashnode_pat`          | Your Hashnode Personal Access Token. Use a GitHub Secret for this value. | `true`   |          |
| `publication_id`        | The ID of the Hashnode publication.                                      | `true`   |          |
| `post_status`           | The status of the published post. Accepts `draft` or `public`            | `false`  | `public` |
| `update_existing_posts` | Set to `true` to update posts that have already been published.          | `false`  | `false`  |

## 📝 Post Front Matter

Your Markdown files must include a YAML front matter block at the top with the required metadata. The action uses the `title` and `tags` to create a new post. If `update_existing_posts` is `true`, the `publishedUrl` will be used to update an existing post.

#### Required Fields:

- **title:** The title of the post.
- **tags:** An array of strings representing the tags for the post.

#### Optional Fields:

- **subtitle:** A subtitle for the post.
- **coverImage:** URL of the cover image for the post.
- **publishedUrl:** Added automatically by the action after a successful publish. Used for updates.
- **canonicalUrl:** An optional URL if the post was originally published elsewhere.

## Example

```markdown
---
title: "My Awesome Blog Post"
subtitle: "A subtitle for my post."
tags:
  - "github-actions"
  - "hashnode"
  - "automation"
coverImage: "[https://example.com/cover.jpg](https://example.com/cover.jpg)"
canonicalUrl: "[https://example.com/original-post](https://example.com/original-post)"
---

# My Awesome Blog Post

This is the content of my blog post. It's written in Markdown.
```
