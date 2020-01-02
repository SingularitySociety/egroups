import * as ogp from 'ogp-parser'
import * as urlParser from "url";

const getOgpTitle = (ogp_data) => {
  if (ogp_data.ogp && ogp_data.ogp['og:title']) {
    return ogp_data.ogp['og:title'][0];
  }
  if (ogp_data.ogp && ogp_data.ogp['twitter:title']) {
    return ogp_data.ogp['twitter:title'][0];
  }
  if (ogp_data.title) {
    return ogp_data.title;
  }
  return "";
};

const getOgpImage = (ogp_data) => {
  if (ogp_data.ogp && ogp_data.ogp['og:image']) {
    return ogp_data.ogp['og:image'][0];
  }
  if (ogp_data.ogp && ogp_data.ogp['twitter:image']) {
    return ogp_data.ogp['twitter:image'][0];
  }
  return null;
};

const getOgpDescription = (ogp_data) => {
  if (ogp_data.ogp && ogp_data.ogp['og:description']) {
    return ogp_data.ogp['og:description'][0];
  }
  if (ogp_data.ogp && ogp_data.ogp['twitter:description']) {
    return ogp_data.ogp['twitter:description'][0];
  }
  return "";
};

export const parseUrl = async (url) => {
  const myURL = urlParser.parse(url);
  if (myURL.host === null) {
    return null;
  }

  const ogp_data = await ogp(url, true);
  const title = getOgpTitle(ogp_data);
  const image = getOgpImage(ogp_data);
  const description = getOgpDescription(ogp_data);
  
  return {title, image, description};
}


