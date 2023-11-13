<template>
  <div>
    <client-only>
      <div class="user-info-head" @click="editCropper()">
        <img
          v-bind:src="options.img"
          title="點擊上傳頭像"
          class="img-circle img-lg"
        />
      </div>
      <el-dialog
        v-if="open"
        :title="title"
        :visible.sync="open"
        width="800px"
        append-to-body
        @opened="modalOpened"
        @close="closeDialog"
      >
        <el-row>
          <el-col :xs="24" :md="12" :style="{ height: '350px' }">
            <client-only>
              <VueCropper
                ref="cropper"
                :img="options.img"
                :info="true"
                :autoCrop="options.autoCrop"
                :autoCropWidth="options.autoCropWidth"
                :autoCropHeight="options.autoCropHeight"
                :fixedBox="options.fixedBox"
                @real-time="realTimeImg"
                v-if="visible"
              />
            </client-only>
          </el-col>
          <el-col :xs="24" :md="12" :style="{ height: '350px' }">
            <div class="avatar-upload-preview">
              <img :src="previews.url" :style="previews.img" />
            </div>
          </el-col>
        </el-row>
        <br />
        <el-row>
          <el-col :lg="2" :md="2">
            <el-upload
              action="#"
              :http-request="requestUpload"
              :show-file-list="false"
              :before-upload="beforeUpload"
            >
              <el-button size="small">
                選擇
                <i class="el-icon-upload el-icon--right"></i>
              </el-button>
            </el-upload>
          </el-col>
          <el-col :lg="{ span: 1, offset: 2 }" :md="2">
            <el-button
              icon="el-icon-plus"
              size="small"
              @click="changeScale(1)"
            ></el-button>
          </el-col>
          <el-col :lg="{ span: 1, offset: 1 }" :md="2">
            <el-button
              icon="el-icon-minus"
              size="small"
              @click="changeScale(-1)"
            ></el-button>
          </el-col>
          <el-col :lg="{ span: 1, offset: 1 }" :md="2">
            <el-button
              icon="el-icon-refresh-left"
              size="small"
              @click="rotateLeft()"
            ></el-button>
          </el-col>
          <el-col :lg="{ span: 1, offset: 1 }" :md="2">
            <el-button
              icon="el-icon-refresh-right"
              size="small"
              @click="rotateRight()"
            ></el-button>
          </el-col>
          <el-col :lg="{ span: 2, offset: 6 }" :md="2">
            <el-button type="primary" size="small" @click="uploadImg()"
              >提 交</el-button
            >
          </el-col>
        </el-row>
      </el-dialog>
    </client-only>
  </div>
</template>

<script>
import userInfoApi from "@/api/userInfo";
// const VueCropper = (resolve) => resolve(require("vue-cropper"));

export default {
  props: {
    user: {
      type: Object,
    },
  },
  // components: { VueCropper },
  data() {
    return {
      // 是否顯示彈出層
      open: false,
      // 是否顯示cropper
      visible: false,
      // 彈出層標題
      title: "修改頭像",
      options: {
        img: "", //裁剪圖片的地址
        autoCrop: true, // 是否默認生成截圖框
        autoCropWidth: 200, // 默認生成截圖框寬度
        autoCropHeight: 200, // 默認生成截圖框高度
        fixedBox: true, // 固定截圖框大小 不允許改變
      },
      previews: {},
    };
  },
  created() {
    if (process.client) {
    }
    // this.options.img = this.handleCampusUrl(news.avatar);
  },
  watch: {
    user(news, olds) {
      this.options.img = this.handleCampusUrl(news.avatar);
    },
  },
  methods: {
    // 編輯頭像
    editCropper() {
      this.open = true;
      this.visible = true;
    },
    // 打開彈出層結束時的回調
    modalOpened() {
      this.visible = true;
    },
    // 覆蓋默認的上傳行為
    requestUpload() {},
    // 向左旋轉
    rotateLeft() {
      this.$refs.cropper.rotateLeft();
    },
    // 向右旋轉
    rotateRight() {
      this.$refs.cropper.rotateRight();
    },
    // 圖片縮放
    changeScale(num) {
      num = num || 1;
      this.$refs.cropper.changeScale(num);
    },
    // 上傳預處理
    beforeUpload(file) {
      if (file.type.indexOf("image/") == -1) {
        this.$modal.msgError(
          "文件格式錯誤，請上傳圖片類型,如：JPG，PNG後綴的文件。"
        );
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.options.img = reader.result;
        };
      }
    },
    // 上傳圖片
    uploadImg() {
      this.$refs.cropper.getCropBlob((data) => {
        let formData = new FormData();
        formData.append("avatarfile", data);
        userInfoApi.uploadAvatar(formData).then((response) => {
          this.open = false;
          this.options.img = this.handleCampusUrl(response.imgUrl);
          // store.commit('SET_AVATAR', this.options.img);
          this.$modal.msgSuccess("修改成功");
          this.visible = false;
        });
      });
    },
    // 實時預覽
    realTimeImg(data) {
      this.previews = data;
    },
    // 關閉窗口
    closeDialog() {
      this.options.img = this.handleCampusUrl(this.user.avatar);
      this.visible = false;
    },
  },
};
</script>
<style scoped>
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
}

.user-info-head:hover::after {
  content: "+";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
/* image */
.img-circle {
  border-radius: 50%;
}

.img-lg {
  width: 120px;
  height: 120px;
}

.avatar-upload-preview {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;
}
</style>