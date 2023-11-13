<template>
  <div  class="index-bg woo-box-flex" >

    <!-- 菜單 -->
    <CampusMenu
      class="hidden-xs-only"
      v-if="categoryObj != null"
      :categoryObj="categoryObj"
      @handleCategory="selectCatrgory"
    ></CampusMenu>

    <div class="campus-main">
      <div class="woo-box-flex">
        <!-- 消息盒子 -->
        <div class="content-t"  v-loading="loading">
          <Content
            v-for="(item, key) in contentObj"
            :key="key"
            :contentObj="item"
            :loveContentIds="loveContentIds"
          ></Content>
          <!-- 分頁 -->
          <div class="fenye" v-if="!loading">
            <el-pagination
              :hide-on-single-page="true"
              background
              layout="prev, pager, next"
              :total="total"
              :current-page="currentPage"
              :page-size="5"
              @current-change="handleCurrentChange"
            >
            </el-pagination>
          </div>
        </div>
        <!-- 側邊欄內容 -->
        <CampusSide class="hidden-xs-only"></CampusSide>
      </div>
    </div>
  </div>
</template>

<script>
//api
import touristApi from "@/api/tourist";
import operateApi from "@/api/operate";

import cookie from "js-cookie";

import { getToken, setToken, removeToken } from "@/utils/auth";
//引用組件
import Content from "@/components/Content";
import CampusMenu from "@/components/Menu";
import CampusSide from "@/components/CampusSide";

export default {
  components: { Content, CampusMenu },
  data() {
    return {
      //菜單分類
      categoryObj: null,
      //墻內容
      contentObj: [],
      //點贊的墻列表
      loveContentIds: [],
      contentVo: {
        pageNum: 1,
        categoryId: null,
      },
      //是否加載
      loading: true,
      total: 0,
      currentPage: 1,
    };
  },

  //創建的時候自動調用
  created() {

    this.getAllCategorys();
    this.getContent(this.contentVo);
  },
  //創建後
  mounted() {
    this.contentVo.pageNum = 1;
    // this.contentVo.categoryId = 0;

  },
  methods: {

    //點擊菜單後（子組件傳遞數據）
    selectCatrgory(data) {
      this.contentVo.categoryId = data;
      this.getContent(this.contentVo);
    },

    //獲取全部分類
    getAllCategorys() {
      touristApi
        .getCategoryList()
        .then((response) => {
          this.categoryObj = response.data;
        })
        .catch();
    },
    //獲取所有內容
    getContent(contentVo) {
      this.loading = true;
      touristApi
        .getContent(contentVo)
        .then((response) => {
          this.contentObj = response.rows;
          this.total = parseInt(response.total);
          this.loveContentIds = response.loveContentIds;
          this.loading = false;
        })
        .catch((response) => {});
    },
    //當頁數改變的時候
    handleCurrentChange(val) {
      this.contentVo.pageNum = val;
      this.currentPage = this.contentVo.pageNum;
      this.getContent(this.contentVo);
    },
  },
};
</script>

<style>
.index-bg {
  /* box-shadow: 0 25px 45px rgb(0 0 0 / 10%); */
  /* border: 1px solid rgba(255, 255, 255, 0.5); */
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;

  max-width: 1122px;
  margin: auto;
}
.tag-group {
  text-align: center;
}
/* 分頁 */
.fenye {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}
/* 標簽 */
.clickable {
  margin-top: 5px;
  cursor: pointer;
}
.content-t {
  margin: 20px 0 0 0;
}
</style>
