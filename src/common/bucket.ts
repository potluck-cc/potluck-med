export function getPublicBucketLink(itemName: string) {
  if (__DEV__) {
    return `https://s3.amazonaws.com/potluckdev-userfiles-mobilehub-657079931/public/${itemName}`;
  } else {
    return `https://s3.amazonaws.com/potluckenduserapps-userfiles-mobilehub-1743265075/public/${itemName}`;
  }
}

export default getPublicBucketLink;
