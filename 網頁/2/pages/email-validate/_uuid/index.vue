<template>
  <div class="main-full-middle" v-loading="loading">
    <div style="width: 642px">
      <div v-if="!loading">
        <el-result
          icon="success"
          v-if="success"
          title="綁定成功"
          subTitle="將在3秒後跳轉到首頁"
        >
          <template slot="extra">
            <el-button type="primary" size="medium" @click="goHome()"
              >首頁</el-button
            >
          </template>
        </el-result>

        <el-result
          icon="error"
          v-else
          title="綁定失敗"
          subTitle="請重新綁定，將在3秒後跳轉到首頁"
        >
          <template slot="extra">
            <el-button type="primary" size="medium">返回</el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script>
//api
import { emailValidate } from "@/api/login";

export default {
  data() {
    return {
      uuid: "",
      loading: true,
      success: "",
    };
  },

  //創建的時候自動調用
  created() {
    this.uuid = this.$route.params.uuid;
    this.email(this.uuid);
  },
  //創建後
  mounted() {},
  methods: {
    //獲取所有內容
    email(uuid) {
      emailValidate(uuid)
        .then((response) => {
          this.loading = false;
          this.success = response.data;
        })
        .catch((response) => {});
      this.goHome();
    },
    goHome() {
      let count = 3; //賦值多少秒
      var times = setInterval(() => {
        count--; //遞減
        if (count <= 0) {
          // <=0
          this.$router.push({ path: "/" });
          clearInterval(times);
        }
      }, 1000); //1000毫秒後執行
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
