<template>
  <div class="publish-content">
    <el-row>
      <el-col :span="8" :xs="20">
        <el-dialog title="快捷發布" :visible.sync="dialog" width="600px;">
          <div>
            <div>
              <el-input
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 10 }"
                placeholder="請輸入內容"
                v-model="contentParam.content"
                maxlength="500"
                show-word-limit
              >
              </el-input>
              <div class="woo-box-flex woo-box-alignCenter">
                <div class="woo-box-item-flex" style="align-self: center">
                  <!-- 分類 -->
                  <div class="woo-box-item-inlineBlock">
                    <el-cascader
                      size="small"
                      placeholder="請選擇分類"
                      v-model="cascader"
                      :options="categoryOptions"
                      :props="props"
                      class="c-cascader"
                    ></el-cascader>
                  </div>

                  <div class="woo-box-item-inlineBlock">
                    <el-button
                      type="text"
                      @click="selectPicture()"
                      :disabled="disabled.picture"
                    >
                      <svg-icon
                        class="woo-font woo-font--emotico"
                        style="width: 18px; height: 18px"
                        icon-class="picture"
                      />
                      <span class="iconbed-text">圖片</span>
                    </el-button>
                  </div>
                  <div class="woo-box-item-inlineBlock">
                    <el-button
                      type="text"
                      @click="selectVideo()"
                      :disabled="disabled.video"
                    >
                      <svg-icon
                        class="woo-font woo-font--emotico"
                        style="width: 18px; height: 18px"
                        icon-class="video"
                      />
                      <span class="iconbed-text">視頻</span>
                    </el-button>
                  </div>
                </div>
                <el-button
                  type="primary"
                  round
                  style="margin-top: 15px"
                  :disabled="contentParam.content.length <= 0"
                  @click="publishContent()"
                >
                  發布
                </el-button>
              </div>
              <el-upload
                style="height: 15x"
                :headers="upload.headers"
                v-show="upload.show"
                ref="upload"
                :limit="upload.limit"
                :action="upload.action"
                :show-file-list="true"
                :list-type="upload.listType"
                :accept="upload.accept"
                :auto-upload="false"
                :on-change="handleChange"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-exceed="handleExceed"
                :on-success="handleSuccess"
                :on-error="handleError"
              >
                <button id="uploadBtn" v-show="false"></button>
              </el-upload>
            </div>
          </div>
        </el-dialog>
      </el-col>
    </el-row>
  </div>
</template>

<script>
//引入接口定義的js文件
import operateApi from "@/api/operate";
import userInfoApi from "@/api/userInfo";
import touristApi from "@/api/tourist";
import { getToken } from "@/utils/auth";

export default {
  data() {
    return {
      //分類
      props: {
        expandTrigger: "hover",
        value: "categoryId",
        label: "categoryName",
        children: "children",
      },
      //請求參數
      contentParam: {
        categoryId: "",
        type: 0,
        isAnonymous: 0,
        content: "",
        fileList: [],
      },
      //禁用
      disabled: {
        picture: false,
        video: false,
      },
      //上傳參數
      upload: {
        show: false,
        action: "",
        limit: 3,
        accept: "",
        listType: "",
        headers: {},
      },
      //選擇的分類
      cascader: [],
      fileCount: 0,
      fileList: [],
      //分類列表
      categoryOptions: [],
      dialog: true,
      //1圖片,2視頻
      selectType: 0,
    };
  },
  created() {
    if (getToken() === undefined) {
      this.$router.push({ path: "/userlogin" });
    }
    this.upload.headers["Authorization"] = "Bearer " + getToken();
    this.haveMail();
  },
  mounted() {
    this.$nextTick(function () {
      //元素加載完成後執行的代碼
      this.getTreeselect();
      //this.$refs.searchAddress.$el.click()
    });
  },

  methods: {
    //初始化數據
    haveMail() {
      userInfoApi
        .haveMail()
        .then((response) => {})
        .catch((response) => {
          var count = 3; //賦值多少秒
          var times = setInterval(() => {
            count--; //遞減
            if (count <= 0) {
              clearInterval(times);
              this.$router.push({ path: "/user/profile" });
            } else {
              this.$message.warning(
                "將再 " + count + " 秒後跳轉到綁定郵箱頁面"
              );
            }
          }, 1000); //1000毫秒後執行
        });
    },
    //選擇圖片
    selectPicture() {
      //   this.$refs.uploadBtn.$el.click();
      //   this.$refs.uploadBtn.dispatchEvent(new MouseEvent('click'));
      this.upload.action = this.handleCampusUrl("/campus/imageUpload");
      this.upload.limit = 3;
      this.upload.accept = "image/*";
      this.upload.listType = "picture-card";
      this.selectType = 1;
      document.getElementById("uploadBtn").click();
    },
    selectVideo() {
      console.log("選擇視頻");
      //   this.$refs.uploadBtn.$el.click();
      //   this.$refs.uploadBtn.dispatchEvent(new MouseEvent('click'));
      this.upload.action = this.handleCampusUrl("/campus/videoUpload");
      this.upload.limit = 1;
      this.upload.accept = "video/*";
      this.upload.listType = "text";
      this.selectType = 2;
      document.getElementById("uploadBtn").click();
    },
    /** 查詢下拉樹結構 */
    getTreeselect() {
      touristApi.getCategoryList().then((response) => {
        let lists = response.data;

        for (let i = 0; i < lists.length; i++) {
          if (lists[i].type == "Y") {
            lists.splice(i, 1);
          }
        }
        this.categoryOptions = this.handleTree(lists, "categoryId");
      });
    },
    //文件移除
    handleRemove(file, fileList) {
      console.log(file, fileList);
      this.checkBtn();
    },
    //點擊文件列表中已上傳的文件時的鉤子
    handlePreview(file) {
      console.log(file);
    },
    //上傳成功
    handleSuccess(response, file, fileList) {
      if (response.code != 200) {
        fileList.splice(fileList.length - 1, 1);
        this.$message.warning(response.msg);
        setTimeout(() => {
          this.$message.error("上傳失敗，請重新上傳");
        }, 1000);
      }
      this.checkBtn();
    },
    handleError(err, file, fileList) {
      this.$message.error("上傳失敗");
      this.checkBtn();
    },
    //文件改變
    handleChange(file, fileList) {
      console.log(file);
      this.fileList = fileList;
      let fileNum = fileList.length;
      //添加文件
      if (this.fileCount < fileNum) {
        if (file.raw.type.startsWith("image")) {
          this.disabled.video = true;
        } else {
          this.disabled.picture = true;
        }
        this.validated(file);
        //上傳文件
        this.$refs.upload.submit();
      }
      this.fileCount = fileNum;

      if (fileNum > 0) {
        this.upload.show = true;
      }
      this.checkBtn();
    },
    handleExceed(files, fileList) {
      this.$message.warning(`上傳數量超過限製`);
    },
    //驗證文件類型
    validated(file) {
      // 若不符合類型，則讓當前上傳的文件去除掉即可，即從上傳對列刪除本次上傳
      const size = file.size / 1024 / 1024;
      if (this.selectType == 1) {
        if (!file.raw.type.startsWith("image")) {
          this.$message.warning(`請選擇圖片`);
          this.fileList.splice(this.fileList.length - 1, 1);
        }

        if (size > 5) {
          this.fileList.splice(this.fileList.length - 1, 1);
          this.$message.warning("上傳的圖片大小不能超過 5MB!");
        }
      } else {
        if (!file.raw.type.startsWith("video")) {
          this.$message.warning(`請選擇視頻`);
          this.fileList.splice(this.fileList.length - 1, 1);
        }
        if (size > 20) {
          this.fileList.splice(this.fileList.length - 1, 1);
          this.$message.warning("上傳的視頻大小不能超過 20MB!");
        }
      }
    },
    checkBtn() {
      if (this.fileList.length == 0) {
        this.upload.show = false;
        this.disabled.picture = false;
        this.disabled.video = false;
      }
    },
    //發布
    publishContent() {
      this.contentParam.fileList = [];
      console.log(this.fileList);
      for (let file of this.fileList) {
        if (file.raw.type.startsWith("image")) {
          this.contentParam.type = 1;
        }
        if (file.raw.type.startsWith("video")) {
          this.contentParam.type = 2;
        }
        if (file.response !== undefined && file.response.code == 200) {
          this.contentParam.fileList.push(file.response.data.fileId);
        } else {
          console.log("禁止");
        }
      }
      if (this.cascader.length != 2) {
        this.$message.warning("請選擇分類");
        return;
      } else {
        this.contentParam.categoryId = this.cascader[1];
      }
      //請求
      operateApi.publishContent(this.contentParam).then((response) => {
        this.$message.success("發表成功，請等待管理的審核");
        this.$router.push({ path: "/User/management?types=1" });
      });
    },
  },
};
</script>
<style scoped>
.iconbed-text {
  margin: 0 8px 0 2px;
  font-size: 13px;
  /* color: rgb(131, 131, 131); */
}
.c-cascader {
  border-radius: 0;
}
</style>
