import React from 'react';
import Helmet from 'react-helmet';
import {useLocation} from '@reach/router';
import {useStaticQuery, graphql} from 'gatsby';

// @ts-ignore
import generalSiteCard from '@images/card.png';

// @ts-ignore
import favico from '@images/favico.png';

// @ts-ignore
import {ContentAndMetadataQuery, Node} from '@root/graphql-types';

const seoQuery = graphql`
  query contentAndMetadata {
    site {
      siteMetadata {
        baseUrl
        title
        description
        social {
          fbAppID
          twitterUserTag
        }
      }
    }
    allMdx {
      nodes {
        excerpt(pruneLength: 200)
        frontmatter{
          title
        }
        slug
      }
    }
  }
`;

type SEOMetadataProps = {
  title: string,
  type: string,
  ogTitle: string,
  description: string,
  thumbnail: string,
  url: string,
  social: {
    fbAppId: number,
    twitterUserTag: string
  }
}

const defaultSeoMetadata: SEOMetadataProps = {
  title: '',
  type: '',
  ogTitle: '',
  description: '',
  thumbnail: '',
  url: '',
  social: {
    fbAppId: 0,
    twitterUserTag: '',
  },
};

type SEOProps = {
  children: JSX.Element | JSX.Element[]
}

const SEO: React.FunctionComponent<SEOProps> = ({children}) => {
  const [seoMetadata, setSeoMetadata] = React.useState<SEOMetadataProps>(defaultSeoMetadata);
  const seoQueriedData: ContentAndMetadataQuery = useStaticQuery(seoQuery);
  const canonicalURL = (typeof window !== 'undefined') ? useLocation().href.split('?')[0]: '';

  const determinePageType = () => {
    const checkIfUrlIsSubpathOf = (pattern: string) => {
      return canonicalURL.includes(pattern) && !canonicalURL.endsWith(pattern);
    };
    return checkIfUrlIsSubpathOf('/posts') || checkIfUrlIsSubpathOf('/projects');
  };

  const filterQueriedData = () => {
    const currentSlug = canonicalURL.split('/').at(-1);
    const [pageNode] = seoQueriedData.allMdx.nodes.filter((node: Node) => {
      return node.slug === currentSlug;
    });
    return {
      'title': pageNode.frontmatter.title,
      'description': pageNode.excerpt,
    };
  };

  React.useEffect(() => {
    const pageType = determinePageType();
    const getArticleMetadata = async () => {
      return pageType ? await filterQueriedData() : seoQueriedData;
    };
    getArticleMetadata().then((articleMetadata) => {
      const titleFlair = articleMetadata.title ? `${articleMetadata.title} | ` : '';
      setSeoMetadata({
        'title': `${titleFlair}${seoQueriedData.site.siteMetadata.title}`.trim(),
        'type': pageType ? 'article' : 'website',
        'ogTitle': articleMetadata.title,
        'description': articleMetadata.description?.replace('\n', ' '),
        'thumbnail': `${seoQueriedData.site.siteMetadata.baseUrl}${generalSiteCard}`,
        'url': canonicalURL,
        'social': seoQueriedData.site.social,
      });
    });
  }, []);

  return (
    // @ts-ignore
    <><Helmet>
      <meta charSet="utf-8" my-seo />
      <meta httpEquiv="Expires" content="600" my-seo />

      <title my-seo>{seoMetadata.title}</title>
      <link rel="icon" type="image/png" href={favico} sizes="16x16" my-seo />
      <link href={seoMetadata.url} rel="canonical" my-seo />
      <meta name="description" content={seoMetadata.description} my-seo />
      <meta name="image" content={seoMetadata.thumbnail} my-seo />

      <meta property="og:url" content={seoMetadata.url} my-seo />
      <meta property="og:type" content={seoMetadata.type} my-seo />
      <meta property="og:title" content={seoMetadata.ogTitle} my-seo />
      <meta property="og:description" content={seoMetadata.description} my-seo />
      <meta property="og:image" content={seoMetadata.thumbnail} my-seo />
      <meta property="fb:app_id" content={seoMetadata.social?.fbAppId.toString()} my-seo />

      <meta name="twitter:card" content="summary_large_image" my-seo />
      <meta name="twitter:creator" content={seoMetadata.social?.twitterUserTag} my-seo />
      <meta name="twitter:title" content={seoMetadata.title} my-seo />
      <meta name="twitter:description" content={seoMetadata.description} my-seo />
      <meta name="twitter:image" content={seoMetadata.thumbnail} my-seo />
    </Helmet>
    {children}
    </>
  );
};

export default SEO;
