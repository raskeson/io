import store from '@/store'
import router from '@/router';

export default {
  // 刷新當前tab頁簽
  refreshPage(obj) {
    const { path, query, matched } = router.currentRoute;
    if (obj === undefined) {
      matched.forEach((m) => {
        if (m.components && m.components.default && m.components.default.name) {
          if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
            obj = { name: m.components.default.name, path: path, query: query };
          }
        }
      });
    }
    return store.dispatch('tagsView/delCachedView', obj).then(() => {
      const { path, query } = obj
      router.replace({
        path: '/redirect' + path,
        query: query
      })
    })
  },
  // 關閉當前tab頁簽，打開新頁簽
  closeOpenPage(obj) {
    store.dispatch("tagsView/delView", router.currentRoute);
    if (obj !== undefined) {
      return router.push(obj);
    }
  },
  // 關閉指定tab頁簽
  closePage(obj) {
    if (obj === undefined) {
      return store.dispatch('tagsView/delView', router.currentRoute).then(({ lastPath }) => {
        return router.push(lastPath || '/');
      });
    }
    return store.dispatch('tagsView/delView', obj);
  },
  // 關閉所有tab頁簽
  closeAllPage() {
    return store.dispatch('tagsView/delAllViews');
  },
  // 關閉左側tab頁簽
  closeLeftPage(obj) {
    return store.dispatch('tagsView/delLeftTags', obj || router.currentRoute);
  },
  // 關閉右側tab頁簽
  closeRightPage(obj) {
    return store.dispatch('tagsView/delRightTags', obj || router.currentRoute);
  },
  // 關閉其他tab頁簽
  closeOtherPage(obj) {
    return store.dispatch('tagsView/delOthersViews', obj || router.currentRoute);
  },
  // 添加tab頁簽
  openPage(title, url, params) {
    var obj = { path: url, meta: { title: title } }
    store.dispatch('tagsView/addView', obj);
    return router.push({ path: url, query: params });
  },
  // 修改tab頁簽
  updatePage(obj) {
    return store.dispatch('tagsView/updateVisitedView', obj);
  }
}
