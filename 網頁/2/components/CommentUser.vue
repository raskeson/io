<template>
  <div class="commen-u" style="margin-top: 5px">
    <!-- 評論 -->
    <div class="comment-list">
      <!-- 評論列表 -->
      <div class="comment-item" style="margin-top: 10px">
        <div class="woo-box-flex">
          <!-- 頭像 -->
          <el-avatar
            shape="circle"
            :size="40"
            :src="handleCampusUrl(commentObj.avatar)"
          ></el-avatar>
          <!-- 昵稱、評論內容、時間 -->
          <div class="woo-box-item-flex" style="margin: -2px 0 0 10px">
            <div>
              <span class="comment-nick"> {{ commentObj.userNickName }}
                <span v-if="commentObj.toUserNickName!=null">
                  <i class="el-icon-caret-right" style="color:black"></i> {{ commentObj.toUserNickName }}</span>
              </span>
              <!-- 是否是作者 -->
              <span
                class="comment-item-tag"
                style="background: rgb(254, 44, 85)"
                v-if="commentObj.userId == contentObj.userId"
                ><span>作者</span>
              </span>
            </div>

            <div style="text-align: left; margin-top: 5px">
              {{ commentObj.coContent }}
            </div>

            <div
              class="
                comment-info
                woo-box-flex woo-box-alignCenter woo-box-justifyBetween
              "
            >
              <div>
                <span> {{ handelTimeFormat(commentObj.createTime) }} </span>
                <span>·{{ commentObj.address }}</span>
              </div>
              <div class="woo-box-flex" style="margin-right: 20px">
                <div
                  class="
                    comment-iconbed
                    woo-box-flex woo-box-alignCenter woo-box-justifyCenter
                  "
                >
                  <!-- <i class="woo-font woo-font--comment" title="評論"></i> -->
                  <svg-icon
                    class="comment-tool-iconbed"
                    v-if="commentObj.userId == loginUserId"
                    icon-class="delete"
                  />
                </div>

                <div
                  class="
                    comment-iconbed
                    woo-box-flex woo-box-alignCenter woo-box-justifyCenter
                  "
                  @click="openCommentChild(commentObj.commentId)"
                >
                  <svg-icon class="comment-tool-iconbed" icon-class="comment" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 評論彈出框 -->
    <el-dialog
      title="回復"
      :visible.sync="dialog"
      width="600px"
      append-to-body
    >
      <div class="woo-box-item-flex" style="align-self: center">
        <el-input
          type="textarea"
          placeholder="發布你的回復"
          :autosize="{ minRows: 2, maxRows: 5 }"
          v-model="dialogText"
          maxlength="100"
          show-word-limit
        >
        </el-input>
      </div>
      <div class="woo-box-flex woo-box-alignCenter">
        <div class="woo-box-item-flex" style="align-self: center"></div>
        <el-button
          type="primary"
          round
          style="margin-top: 15px"
          :disabled="dialogText.length <= 0"
          @click="addCommentChild()"
        >
          回復
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
import operateApi from "@/api/operate";

export default {
  name: "CommentUser",
  props: ["commentObj", "contentObj"],
  data() {
    //這裏存放數據
    return {
      loginUserId: 0,
      //添加評論參數
      toCommentQuery: {
        contentId: null,
        commentId: null,
        coContent: "",
      },
      //****評論彈出框 */
      dialog: false,
      dialogText: "",
      dialogCommentId: "",
    };
  },
  //生命周期 - 創建完成（可以訪問當前this實例）
  created() {},
  //生命周期 - 掛載完成（可以訪問DOM元素）
  mounted() {
    if (getToken() !== undefined) {
      this.loginUserId = this.globalVariable.userInfoGlobal.userId;
    }
  },
  //方法集合
  methods: {
    //添加子評論
    openCommentChild(commentId) {
      this.dialog = true;
      this.dialogCommentId = commentId;
    },
    addCommentChild() {
      this.toCommentQuery.commentId = this.dialogCommentId;
      this.toCommentQuery.contentId = null;
      this.toCommentQuery.coContent = this.dialogText;
      this.dialog = false;
      operateApi.toComment(this.toCommentQuery).then((response) => {
        this.$message({
          type: "success",
          message: "評論成功!",
        });
        this.dialogText = "";
        this.$emit("co-success", response);
      });
    },
  },
};
</script>
<style>
.comment-nick {
  font-weight: bolder;
  font-size: 12px;
  color: #eb7350;
  text-align: left;
}
/* 作者標簽 */
.comment-item-tag {
  flex-shrink: 0;
  font-size: 10px;
  height: 16px;
  margin-left: 8px;
  color: #fff;

  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  font-weight: 500;
  justify-content: center;
  line-height: 20px;
  padding: 0 4px;
}
/* 工具欄圖標 */
.comment-tool-iconbed {
  font-size: 14px;
  color: grey;
  margin: 0 0 0 10px;
  position: relative;
}
</style>