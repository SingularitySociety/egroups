import * as ogpUtil from "../utils/ogp"

export const opg_update = async (change, context) => {
  const snapshot = change.after;
  const data = await snapshot.data();
  if (data.type === "url" && data.url && data.isNew) { 
    try {
      const ogp_data = await ogpUtil.parseUrl(data.url);
      if (ogp_data) {
        ogp_data["isNew"] = false;
        ogp_data["hasData"] = true;
        await snapshot.ref.update(ogp_data);
      } else {
        await snapshot.ref.update({isNew: false});
      }
    } catch (e) {
      console.log(e);
      await snapshot.ref.update({isNew: false});
    }
  }
};
