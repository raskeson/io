<template>
  <div class="main-full-middle">
    <div style="width:642px;">
      <!-- 消息盒子 -->
      <Content
        :contentObj="contentObj"
        v-if="contentObj != null"
        :loveContentIds="loveContentIds"
      ></Content>
    </div>
  </div>
</template>

<script>
//api
import touristApi from "@/api/tourist";

//引用組件
import Content from "@/components/Content";

export default {
  components: { Content },
  data() {
    return {
      //墻內容
      contentObj: null,
      //點贊的墻列表
      loveContentIds: [],
      contentId: "",
    };
  },

  //創建的時候自動調用
  created() {
    this.contentId = this.$route.params.contentId;
    this.getContent(this.contentId);
  },
  //創建後
  mounted() {},
  methods: {
    //獲取所有內容
    getContent(contentId) {
      touristApi
        .getContentById(contentId)
        .then((response) => {
          let isLove = response.isLove;
          if (isLove) {
            this.loveContentIds.push(contentId);
          }
          this.contentObj = response.data;
        })

        .catch((response) => {});
    },
  },
};
</script>

<style scoped>
.main-full-middle {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.tag-group {
  text-align: center;
}
</style>
