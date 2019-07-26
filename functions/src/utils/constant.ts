
// groups/${group.groupId}/articles/${article.articleId}/${sectionId}  article
// groups/${group.groupId}/members/${item.userId}/images/profile          member
// groups/${group.groupId}/images/profile                              group

// groups/${group.groupId}/owner/verification/${target}   secret

export const thumbnailSizes = [600, 1200];

export const articlePath = {path: {0: "groups", 2: "articles"}, length: 5};
export const pagePath = {path: {0: "groups", 2: "pages"}, length: 5};
export const memberPath = {path: {0: "groups", 2: "members", 4: "images"}, length: 6};
export const groupProfilePath = {path: {0: "groups", 2: "images"}, length: 4};

export const stripeVerificationPath = {path: {0: "groups", 2: "owner", 3: "verification"}, length: 5 }

export const matchImagePaths = [
  articlePath,
  pagePath,
  memberPath,
  groupProfilePath,
];

