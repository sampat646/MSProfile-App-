// src/services/news.service.ts

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  publishedDate: string;
  author: string;
  imageUrl?: string | null;
  body?: string;
  category?: string;
  webUrl?: string;
}

// ---------- HELPERS ----------

const extractAuthorName = (authorField: any): string => {
  if (!authorField) return 'Unknown';

  if (typeof authorField === 'string') return authorField;

  if (Array.isArray(authorField) && authorField.length > 0) {
    return authorField[0].displayName || 'Unknown';
  }

  return 'Unknown';
};

const extractDescription = (htmlContent?: string): string => {
  if (!htmlContent) return '';
  return htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
};

// ---------- LIST NEWS ----------

export const getSharePointNews = async (
  accessToken: string
): Promise<NewsItem[]> => {
  try {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/search/query',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              entityTypes: ['listItem'],
              query: {
                queryString: 'ContentType:News OR PromotedState:2',
              },
              size: 50,
              fields: [
                'title',
                'description',
                'canvasContent1',
                'firstPublishedDate',
                'created',
                'author',
                'bannerImageUrl',
                'promotedState',
                'path',
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const hits = data.value?.[0]?.hitsContainers?.[0]?.hits || [];

    return hits.map((hit: any) => {
      const f = hit.resource?.fields || {};

      return {
        id: hit.resource.id,
        webUrl: hit.resource.webUrl || f.path,
        title: f.title || 'Untitled',
        description: f.description || extractDescription(f.canvasContent1),
        publishedDate: f.firstPublishedDate || f.created || '',
        author: extractAuthorName(f.author),
        imageUrl: f.bannerImageUrl?.url || f.bannerImageUrl || null,
        body: f.canvasContent1 || '',
        category: f.promotedState === 2 ? 'Featured' : 'News',
      };
    });
  } catch (e) {
    console.error('News list error:', e);
    return [];
  }
};


export const getNewsItemDetails = async (
  accessToken: string,
  itemId: string
): Promise<NewsItem | null> => {
  try {
    const siteId = 'your-site-id'; // Replace with actual siteId
    const listId = 'your-list-id'; // Replace with actual listId

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items/${itemId}?expand=fields`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const f = data.fields || {};

    return {
      id: data.id,
      webUrl: f.Path || '',
      title: f.Title || 'Untitled',
      description: f.Description || '',
      publishedDate: f.FirstPublishedDate || f.Created || '',
      author: extractAuthorName(f.Author),
      imageUrl: f.BannerImageUrl?.Url || f.BannerImageUrl || null,
      body: f.CanvasContent1 || '',
      category: f.PromotedState === 2 ? 'Featured' : 'News',
    };
  } catch (e) {
    console.error('News detail error:', e);
    return null;
  }
};


