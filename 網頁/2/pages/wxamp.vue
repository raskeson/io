

<template>
  <div class="wxamp">
    <div>
      <span>使用微信掃一掃登錄</span>
      <div style="margin-top: 20px">
        <img :src="imgUrl" class="code-img" />
      </div>
    </div>
  </div>
</template>


<script>
import cookie from "js-cookie";
import userInfoApi from "@/api/userInfo.js";
import { getWxampImg, checkWxamp, wxampLogin } from "@/api/login";
import { getToken, setToken, removeToken } from "@/utils/auth";

export default {
  data() {
    return {
      imgUrl: "",
      uuid: "",
      scanRes: false,
    };
  },
  mounted() {
    this.getImage();
  },
  methods: {
    //獲取二維碼
    getImage() {
      getWxampImg().then((res) => {
        this.imgUrl = "data:image/gif;base64," + res.img;
        this.uuid = res.uuid;
        this.checkWxamp();
      });
    },
    //判斷是否授權
    checkWxamp() {
      var count = 240; //賦值多少秒
      var times = setInterval(() => {
        this.count--; //遞減
        this.checkWxampApi();
        //登錄成功
        if (this.scanRes) {
          clearInterval(times);
           this.$message.success("登錄成功!");
          this.tologin();
        }
        if (count <= 0) {
          clearInterval(times);
        }
      }, 1000); //1000毫秒後執行
    },
    checkWxampApi() {
      checkWxamp(this.uuid).then((res) => {
        this.scanRes = res.msg == "1" ? true : false;
      });
    },
    tologin() {
      wxampLogin(this.uuid).then((res) => {
        setToken(res.token);
        window.close();
      });
    },
  },
};
</script>


<style>
.wxamp {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>