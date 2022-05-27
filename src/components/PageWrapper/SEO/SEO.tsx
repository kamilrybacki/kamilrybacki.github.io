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
      <meta charSet="utf-8" />
      <meta httpEquiv="Expires" content="600" />

      <title>{seoMetadata.title}</title>
      <link rel="icon" type="image/png" href={favico} sizes="16x16" />
      <link href={seoMetadata.url} rel="canonical" />
      <meta name="description" content={seoMetadata.description} />
      <meta name="image" content={seoMetadata.thumbnail} />

      <meta property="og:url" content={seoMetadata.url} />
      <meta property="og:type" content={seoMetadata.type} />
      <meta property="og:title" content={seoMetadata.ogTitle} />
      <meta property="og:description" content={seoMetadata.description} />
      <meta property="og:image" content={seoMetadata.thumbnail} />
      <meta property="fb:app_id" content={seoMetadata.social?.fbAppId.toString()} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={seoMetadata.social?.twitterUserTag} />
      <meta name="twitter:title" content={seoMetadata.title} />
      <meta name="twitter:description" content={seoMetadata.description} />
      <meta name="twitter:image" content={seoMetadata.thumbnail} />
    </Helmet>
    {children}
    </>
  );
};

export default SEO;
