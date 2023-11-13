<template>
  <div class="ContentBottom">
    <div
      class="content-bootom-svg woo-box-flex woo-box-alignCenter"
      style="margin: 10px 15px 15px 0px"
    >
      <!-- 分享鏈接 -->
      <div class="woo-box-item-flex">
        <div
          class="
            content-bottom-hover
            woo-box-flex woo-box-alignCenter woo-box-justifyCenter
          "
          @click="copys($event, contentObj.contentId)"
        >
          <div class="woo-pop-wrap">
            <img width="20" height="20" src="~/assets/images/fenxiang.png" />
            <span>分享鏈接</span>
          </div>
        </div>
      </div>
      <!-- 評論 -->
      <div class="woo-box-item-flex">
        <div
          class="
            content-bottom-hover
            woo-box-flex woo-box-alignCenter woo-box-justifyCenter
          "
          @click="clickComment()"
        >
          <div class="woo-pop-wrap">
            <img width="20" height="20" src="~/assets/images/pinlun.png" />
            <!-- <svg-icon style="width: 18; height: 18" icon-class="comment" /> -->
            <span>評論</span>
          </div>
        </div>
      </div>
      <!-- 贊 -->
      <div class="woo-box-item-flex">
        <div
          class="
            content-bottom-hover
            woo-box-flex woo-box-alignCenter woo-box-justifyCenter
          "
          @click="setZan(contentObj.contentId)"
        >
          <div class="woo-pop-wrap">
            <img width="20" height="20" :src="zanImg" />
            <span class="zan-num">{{ contentObj.loveCount }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 評論列表 -->
    <div v-if="showComment">
      <Comment :contentObj="contentObj"></Comment>
    </div>
  </div>
</template>

<script>
const dzNotImage = require('~/assets/images/dz.png')
const dzImage = require('~/assets/images/dz1.png')

import operateApi from "@/api/operate";

//復製
import Clipboard from "clipboard";
//認證
import { getToken, setToken, removeToken } from "@/utils/auth";
//組件
import Comment from "@/components/Comment";

export default {
  name: "ContentBottom",
  props: ["zanBoolean", "contentObj"],
  //import引入的組件需要註入到對象中才能使用
  components: { Comment },
  data() {
    //這裏存放數據
    return {
      //點贊/沒點贊的圖片地址
      zanImg: "",
      //是否顯示評論
      showComment: false,
      isZanBoo:false,
    };
  },
  //生命周期 - 創建完成（可以訪問當前this實例）
  created() {},
  //生命周期 - 掛載完成（可以訪問DOM元素）
  mounted() {
    this.isZanBoo = this.zanBoolean;
    this.isZan();
    if (this.$route.name == 'c-contentId') {
      this.showComment = true;
    }
  },
  //方法集合
  methods: {
    //判斷是否被點贊
    isZan() {
      if (this.isZanBoo == false) {
        this.zanImg = dzNotImage;
        return false;
      } else {
        this.zanImg = dzImage;
        return true;
      }
    },
    //點擊評論
    clickComment() {
      this.showComment = !this.showComment;
    },
    //點贊
    setZan(contentId) {
      if (getToken() === undefined) {
        this.$router.push({ path: "/userlogin", query: { id: "1" } });
      } else {
        if (this.isZanBoo == true) {
          //取消點贊
          this.isZanBoo = false;

          this.contentObj.loveCount--;
        } else {
          //設置點贊
          this.isZanBoo = true;
          this.contentObj.loveCount++;
        }
        this.isZan(contentId);
        //發送api
        operateApi.zanContent(contentId).then((response) => {
          if (response.data == 1) {
            //點贊
          }
          if (response.data == 0) {
            //取消點贊
          }
        });
      }
    },
    //復製分享鏈接
    copys(e, contentId) {
      const hostname = window.location.origin;
      const clipboard = new Clipboard(e.target, {
        text: () => hostname + "/c/" + contentId,
      });
      clipboard.on("success", (e) => {
        const h = this.$createElement;
        this.$notify({
          title: "復製成功：",
          message: h("i", { style: "color: teal" }, "快去分享給好盆友吧!"),
        });
        // 釋放內存
        clipboard.destroy();
      });

      clipboard.on("error", (e) => {
        // 不支持復製
        Message({
          message: "該瀏覽器不支持自動復製",
          type: "warning",
        });
        // 釋放內存
        clipboard.destroy();
      });
    },
  },
};
</script>
<style>
.content-bootom-svg {
  font-size: 10px;
  font-weight: bolder;
  color: rgb(110, 110, 110);
}
.zan-num {
  font-weight: bolder;
  cursor: pointer;
  font-size: 10px;
  margin-left: 5px;
}
.content-bottom-hover {
  cursor: pointer;
  color: rgb(110, 110, 110);
}
.content-bottom-hover:hover {
  color: coral;
}
</style>