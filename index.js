const core = require('@actions/core');
const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const axios = require('axios');

// Helper function to extract post ID from Hashnode URL
function extractPostIdFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Handle different Hashnode URL formats
  // e.g., https://username.hashnode.dev/post-title-cuid or https://hashnode.domain.com/post-title-cuid
  const match = url.match(/([a-z0-9]{25})(?:\?|$)/);
  return match ? match[1] : null;
}

// Helper function to create valid Hashnode tag objects
function createHashnodeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags.map(tag => {
    const tagStr = String(tag).trim();
    return {
      slug: tagStr.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove duplicate hyphens
        .replace(/^-|-$/g, ''), // Remove leading/trailing hyphens
      name: tagStr,
    };
  }).filter(tag => tag.slug && tag.name); // Remove empty tags
}

// Helper function to validate required frontmatter
function validateFrontmatter(data, filename) {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push(`Missing or invalid 'title' field`);
  }

  if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
    errors.push(`Missing or invalid 'tags' field (must be a non-empty array)`);
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed for "${filename}": ${errors.join(', ')}`);
  }
}

async function publishPost(variables, hashnodePat) {
  const mutation = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          title
          url
        }
      }
    }
  `;

  const response = await axios.post(
    'https://gql.hashnode.com/',
    {
      query: mutation,
      variables: variables
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': hashnodePat,
      },
    }
  );

  if (response.data.errors) {
    throw new Error(`Hashnode API error: ${response.data.errors.map(e => e.message).join(', ')}`);
  }

  return response.data.data.publishPost?.post;
}

async function updatePost(variables, hashnodePat) {
  const mutation = `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) {
        post {
          id
          title
          url
        }
      }
    }
  `;

  const response = await axios.post(
    'https://gql.hashnode.com/',
    {
      query: mutation,
      variables: variables
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': hashnodePat,
      },
    }
  );

  if (response.data.errors) {
    throw new Error(`Hashnode API error: ${response.data.errors.map(e => e.message).join(', ')}`);
  }

  return response.data.data.updatePost?.post;
}

async function processMarkdownFile(filePath, hashnodePat, publicationId, postStatus, updateExistingPosts) {
  const filename = path.basename(filePath);

  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parsed = matter(fileContent);

    // Validate required fields
    validateFrontmatter(parsed.data, filename);

    const { title, tags, publishedUrl, subtitle, canonicalUrl, coverImage } = parsed.data;
    const hashnodeTags = createHashnodeTags(tags);

    if (hashnodeTags.length === 0) {
      throw new Error(`No valid tags found after processing`);
    }

    // Determine if we should update or publish
    const shouldUpdate = updateExistingPosts && publishedUrl;
    const postId = shouldUpdate ? extractPostIdFromUrl(publishedUrl) : null;

    if (shouldUpdate && !postId) {
      core.warning(`Could not extract post ID from URL "${publishedUrl}" for "${filename}". Will create new post instead.`);
    }

    let postData;

    if (shouldUpdate && postId) {
      // Update existing post
      const variables = {
        input: {
          id: postId,
          title: title.trim(),
          subtitle: subtitle?.trim() || null,
          contentMarkdown: parsed.content,
          tags: hashnodeTags,
          ...(canonicalUrl && {
            isRepublished: { originalArticleURL: canonicalUrl }
          }),
          ...(coverImage && {
            coverImageOptions: { coverImageURL: coverImage }
          }),
        }
      };

      core.info(`Updating existing post: ${title}`);
      postData = await updatePost(variables, hashnodePat);

    } else {
      // Publish new post
      const variables = {
        input: {
          title: title.trim(),
          subtitle: subtitle?.trim() || null,
          contentMarkdown: parsed.content,
          tags: hashnodeTags,
          publicationId: publicationId,
          ...(postStatus === 'draft' && { publishedAt: null }),
          ...(canonicalUrl && {
            isRepublished: { originalArticleURL: canonicalUrl }
          }),
          ...(coverImage && {
            coverImageOptions: { coverImageURL: coverImage }
          }),
        }
      };

      core.info(`Publishing new post: ${title}`);
      postData = await publishPost(variables, hashnodePat);
    }

    if (!postData) {
      throw new Error('No post data returned from API');
    }

    core.info(`✅ Successfully ${shouldUpdate && postId ? 'updated' : 'published'} post: ${postData.title}`);
    core.info(`📄 URL: ${postData.url}`);

    // Update the markdown file with the published URL if it's new or changed
    if (!publishedUrl || publishedUrl !== postData.url) {
      const newFrontMatter = { ...parsed.data, publishedUrl: postData.url };
      const newContent = matter.stringify(parsed.content, newFrontMatter);
      await fs.writeFile(filePath, newContent);
      core.info(`📝 Updated "${filename}" with published URL`);
    }

  } catch (error) {
    core.error(`❌ Failed to process "${filename}": ${error.message}`);
    throw error;
  }
}

async function run() {
  try {
    // Get inputs
    const src = core.getInput('src', { required: true });
    const hashnodePat = core.getInput('hashnode_pat', { required: true });
    const publicationId = core.getInput('publication_id', { required: true });
    const postStatus = core.getInput('post_status') || 'public';
    const updateExistingPosts = core.getBooleanInput('update_existing_posts');

    // Validate inputs
    if (!['draft', 'public'].includes(postStatus)) {
      throw new Error('post_status must be either "draft" or "public"');
    }

    // Check if source directory exists
    try {
      const srcStat = await fs.stat(src);
      if (!srcStat.isDirectory()) {
        throw new Error(`Source path "${src}" is not a directory`);
      }
    } catch (error) {
      throw new Error(`Source directory "${src}" does not exist or is not accessible`);
    }

    // Get markdown files
    const files = await fs.readdir(src);
    const markdownFiles = files.filter(file =>
      path.extname(file).toLowerCase() === '.md' ||
      path.extname(file).toLowerCase() === '.markdown'
    );

    if (markdownFiles.length === 0) {
      core.warning(`No markdown files found in "${src}"`);
      return;
    }

    core.info(`📚 Found ${markdownFiles.length} markdown file(s) to process`);

    // Process files sequentially to avoid rate limiting
    let successCount = 0;
    let errorCount = 0;

    for (const file of markdownFiles) {
      const filePath = path.join(src, file);

      try {
        await processMarkdownFile(filePath, hashnodePat, publicationId, postStatus, updateExistingPosts);
        successCount++;
      } catch (error) {
        errorCount++;
        // Continue processing other files even if one fails
        continue;
      }
    }

    core.info(`\n📊 Summary: ${successCount} successful, ${errorCount} failed`);

    if (errorCount > 0) {
      core.setFailed(`${errorCount} file(s) failed to process. Check the logs above for details.`);
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  core.error(`Unhandled promise rejection: ${reason}`);
  core.setFailed(`Unhandled promise rejection: ${reason}`);
});

run();
