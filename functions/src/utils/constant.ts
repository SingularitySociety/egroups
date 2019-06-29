// groups/${group.groupId}/articles/${article.articleId}/${sectionId}  article
// groups/${group.groupId}/members/${item.uid}/images/profile          member
// groups/${group.groupId}/images/profile                              group

export const thumbnailSizes = [600, 1200];

export const articlePath = {path: {0: "groups", 2: "articles"}, length: 5};
export const memberPath = {path: {0: "groups", 2: "members", 4: "images"}, length: 6};
export const groupProfilePath = {path: {0: "groups", 2: "images"}, length: 4};

export const matchImagePaths = [
  articlePath,
  memberPath,
  groupProfilePath,
];
