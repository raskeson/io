<template>
  <div class="Comment">
    <div style="margin: 15px 20px 0"><!----></div>

    <!-- 評論框 -->
    <div class="woo-box-flex" style="margin: 0 10px">
      <div>
        <el-avatar
          class="content-box-avatar"
          shape="circle"
          :size="40"
          :src="handleCampusUrl(contentObj.params.avatar)"
        ></el-avatar>
      </div>

      <div class="woo-box-item-flex">
        <div>
          <div class="woo-box-item-flex" style="align-self: center">
            <el-input
              type="textarea"
              :autosize="{ minRows: 1.3, maxRows: 5 }"
              placeholder="發布你的評論"
              v-model="toCommentQuery.coContent"
              maxlength="100"
              show-word-limit
            >
            </el-input>
          </div>

          <div style="margin-top: 10px">
            <div class="woo-box-flex woo-box-alignCenter">
              <div class="woo-box-item-flex" style="align-self: center"></div>
              <el-button
                type="primary"
                round
                :disabled="toCommentQuery.coContent.length <= 0"
                @click="addComment()"
              >
                評論
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comment-list">
      <!-- 評論列表 -->
      <div
        class="comment-item"
        v-for="(item, keys) in commentOneLevelList"
        :key="keys"
        style="margin-top: 20px"
      >
        <div class="woo-box-flex">
          <!-- 頭像 -->
          <el-avatar
            shape="circle"
            :size="40"
            :src="handleCampusUrl(item.avatar)"
          ></el-avatar>
          <!-- 昵稱、評論內容、時間 -->
          <div class="woo-box-item-flex" style="margin: -2px 0 0 10px">
            <div>
              <span class="comment-nick"> {{ item.userNickName }}</span>
              <!-- 是否是作者 -->
              <span
                class="comment-item-tag"
                v-if="item.userId == contentObj.userId"
                style="background: rgb(254, 44, 85)"
                ><span>作者</span>
              </span>
            </div>

            <div style="margin-top: 4px">
              {{ item.coContent }}
            </div>

            <div
              class="comment-info woo-box-flex woo-box-alignCenter woo-box-justifyBetween"
            >
              <div>
                <span> {{ handelTimeFormat(item.createTime) }} </span>
                <span>·{{ item.address }}</span>
              </div>
              <!-- 刪除 回復 -->
              <div class="woo-box-flex" style="margin-right: 20px">
                <div
                  class="comment-iconbed woo-box-flex woo-box-alignCenter woo-box-justifyCenter"
                >
                  <svg-icon
                    class="comment-tool-iconbed"
                    v-if="item.userId == loginUserId"
                    icon-class="delete"
                  />
                </div>
                <!-- 添加子評論 -->
                <div
                  class="comment-iconbed woo-box-flex woo-box-alignCenter woo-box-justifyCenter"
                  @click="openCommentChild(item.commentId)"
                >
                  <svg-icon class="comment-tool-iconbed" icon-class="comment" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 更多回復 -->
        <div class="comment-more-replies">
          <div class="comment-more-list">
            <div class="comment-more-item">
              <!-- 作者評論內容 -->
              <div v-if="item.children !== undefined">
                <CommentUser
                  :commentObj="item.children[0]"
                  :contentObj="contentObj"
                  @co-success="commentSuccess"
                ></CommentUser>
              </div>
            </div>

            <!-- 更多評論的數量 -->
            <div
              class="comment-more-item"
              v-if="item.childrenCount > 1"
              @click="showChildren(item)"
            >
              <div style="color: #eb7350; text-align: left">
                <span
                  >共{{
                    item.children == undefined
                      ? item.childrenCount
                      : item.childrenCount
                  }}條回復</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 查看全部回復 -->
    <div v-if="this.$route.name == 'index' && commentTotal != 0">
      <div
        class="woo-divider-main woo-divider-x"
        style="margin: 7px 20px 0 20px"
      >
        <!---->
      </div>
      <nuxt-link :to="'/c/' + contentObj.contentId">
        <div
          class="woo-box-flex woo-box-alignCenter woo-box-justifyCenter CommentFeed_more"
        >
          <div>查看全部{{ commentTotal }}條評論</div>
          <i class="woo-font woo-font--angleRight"></i>
        </div>
      </nuxt-link>
    </div>
    <!-- 暫無評論 -->
    <div v-if="commentTotal == 0"></div>

    <!-- 分頁 -->
    <div class="fenye" v-if="this.$route.name == 'c-contentId'">
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

    <!-- 評論彈出框 -->
    <el-dialog title="回復" :visible.sync="dialog" width="600px">
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

    <!-- 子評論內容彈出框 -->
    <el-dialog title="回復列表" :visible.sync="dialogChildren" width="600px">
      <div>
        <CommentChild
          :commentObj="commentOneLevelObj"
          :contentObj="contentObj"
        ></CommentChild>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import touristApi from "@/api/tourist";
import operateApi from "@/api/operate";

import { getToken, setToken, removeToken } from "@/utils/auth";
//組件
import CommentUser from "@/components/CommentUser";
import CommentChild from "@/components/CommentChild";

export default {
  name: "Comment",
  props: ["contentObj"],
  components: { CommentUser, CommentChild },
  data() {
    //這裏存放數據
    return {
      commentOneLevelList: null,
      //評論請求參數
      commentQuery: {
        contentId: "",
        pageNum: 1,
      },
      //添加評論參數
      toCommentQuery: {
        contentId: null,
        commentId: null,
        coContent: "",
      },
      //登錄賬戶的用戶id
      loginUserId: 0,
      //評論總數量
      commentTotal: 0,
      //****無限滾動,後續更改 */
      scrollLoading: false,
      scrollNoMore: false,
      //****分頁 */
      total: 0, //一級評論數量
      currentPage: 1,
      //****評論彈出框 */
      dialog: false,
      dialogText: "",
      dialogCommentId: "",
      //子評論列表彈出框
      dialogChildren: false,
      //一級評論內容
      commentOneLevelObj: {},
    };
  },
  //生命周期 - 創建完成（可以訪問當前this實例）
  created() {
    this.getCommentList(this.currentPage);
  },
  //生命周期 - 掛載完成（可以訪問DOM元素）
  mounted() {
    if (getToken() !== undefined) {
      this.loginUserId = this.globalVariable.userInfoGlobal.userId;
    }
  },
  //方法集合
  methods: {
    //加載一級評論
    getCommentList(currentPage) {
      this.commentQuery.contentId = this.contentObj.contentId;
      this.commentQuery.pageNum = currentPage;
      touristApi.getOneLevelComment(this.commentQuery).then((response) => {
        this.commentOneLevelList = this.handleTree(response.rows, "commentId");
        this.commentTotal = parseInt(response.allTotal);
        this.total = parseInt(response.total);
      });
    },
    //當頁數改變的時候
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getCommentList(this.currentPage);
    },
    //評論成功後
    commentSuccess(response) {
      this.handleCurrentChange(1);
    },
    //添加評論
    addComment() {
      this.toCommentQuery.commentId = null;
      this.toCommentQuery.contentId = this.contentObj.contentId;
      operateApi.toComment(this.toCommentQuery).then((response) => {
        this.$message({
          type: "success",
          message: "評論成功!",
        });
        this.toCommentQuery.coContent = "";
        this.getCommentList(1);
      });
    },
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
        this.toCommentQuery.coContent = "";
        this.currentPage = 1;
        this.getCommentList(this.currentPage);
      });
    },
    //查看子評論
    showChildren(commentObj) {
      this.commentOneLevelObj = commentObj;
      this.dialogChildren = true;
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
.comment-list {
  font-size: 12px;
  /* font-weight: bolder; */
  line-height: 20px;
  color: #333;
}
.comment-info {
  height: 22px;
  margin: 1px 0 0;
  color: #939393;
}
.comment-iconbed {
  width: 22px;
  height: 22px;
  margin: 0 0 0 10px;
}
.comment-more-replies {
  position: relative;
  margin: 6px 0 2px 44px;
}
.comment-more-replies::before {
  content: "";
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  border-left: 2px solid #f2f2f2;
}
.comment-more-list {
  padding: 0 0 0px 10px;
  line-height: 20px;
  font-size: 12px;
}
.composer_btn {
  width: 68px;
  padding-left: 0 !important;
  padding-right: 0 !important;
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
}
.CommentFeed_more {
  height: 44px;
  background: #fff;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}
.CommentFeed_more:hover {
  color: #eb7350;
}
/* 分頁 */
.fenye {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}
</style>