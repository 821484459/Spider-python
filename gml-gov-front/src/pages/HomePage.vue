<template>
  <el-container>
    <el-header style="height: 9.375rem">
      <div class="flex-title">
        <span><img src="../assets/gml.png" style="width: 12.5rem; height: 3.125rem;"/></span>
        <span><el-divider direction="vertical"></el-divider></span>
        <span style="color: #fff; font-size: 1.5625rem; line-height: 3.125rem;">政府网站GPT</span>
      </div>
      <div class="chat-ask-inner">
        <div class="chat-input">
          <el-input
            type="textarea"
            class="chat-el-input"
            @keydown.enter.native="handleKeyDown($event)"
            autosize
            v-model="userInput"
          ></el-input>
          <div class="chat-submit" @click="senWebsocket()">
            <i class="el-icon-search search"></i>
          </div>
        </div>
      </div>
    </el-header>
    <!-- <el-main> -->
    <div class="content" :style="{ whiteSpace: preLine }"
    v-loading="loading" 
    element-loading-text="拼命加载中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0,0,0,0.8)">
    <div v-show="!isAsk" style="height: 18.75rem; font-size: 1.875rem; font-weight: bolder; display: flex; align-items: center; justify-content: center;">
       欢迎使用政府网站GPT
    </div>
    <div style="min-height: 18.75rem; color: #231815; font-size: 1.25rem; padding-top: 0.625rem;" v-show="isAsk">
      <span v-html="answer"></span>
      <span id="blinkCursor" class="blinkCursor" v-show="isBlink">
            ▋
      </span>
    </div>
    <!-- <el-divider v-show="isAsk"></el-divider> -->
      <hr v-show="showSource">
      <p style="font-size: 1.25rem;" v-show="showSource">回答来源：</p>
      <p v-for="(url,i) in urls" :key="url+i" v-show="showSource">
        <el-link type="success" :href="url"  target="_blank">{{ titles[i] }}</el-link>
      </p>
    </div>

    <!-- </el-main> -->
    <el-footer style="height: 0.625rem;"></el-footer>
  </el-container>
</template>

<script>
// import planeSvg from "@/assets/plane.svg";
// import axios from "axios";
import {markdown} from 'markdown';
import io from 'socket.io-client';

export default {
  name: "HomePage",
  props: {},
  data() {
    return {
      // planeSvg,
      userInput: "",
      answer:"",
      titles:[],
      urls:[],
      loading: false,
      isResult: false, //阻止二次点击
      isAsk:false,
      isBlink:false, // 闪烁效果
      preLine:'pre-line',
      socket:null ,// websocket连接
      showSource: false // 展示来源那部分
    };
  },

  created() {
    this.socket = io('http://search.gml.ac.cn/socket.io/');

    // this.socket = io('http://172.16.11.38:5001/socket.io/');
    // this.socket = io('http://localhost:5000/socket.io/');

    this.socket.on('connect', () => {
      console.log('WebSocket 连接已建立');
    });

    this.socket.on('response', (data) => {
      console.log(data)
      if(data.source_data){
        // console.log(data)
        // console.log("来源数据:",data.source_data)
        const sourceData = data.source_data
        const parsedData = JSON.parse(sourceData)
        
        const titles = Object.keys(parsedData)
          .filter(key => key.startsWith("title"))
          .map(key => parsedData[key]);
        const urls = Object.keys(parsedData)
          .filter(key => key.startsWith("url"))
          .map(key => parsedData[key]);
        this.titles = titles
        this.urls = urls
      }else {
        if(data == 'ANSWER_END') {
          this.showSource = true
          this.isBlink = false
          this.isResult = false
          // console.log("没处理",this.answer)
          this.answer = markdown.toHTML(this.answer)
          // console.log("处理完的",this.answer)
          this.preLine = ''; 
        } else if(data == 'SENSITIVE_END'){
          this.isBlink = false
          this.isResult = false
          this.answer = markdown.toHTML(this.answer)
          this.preLine = ''; 
        } else {
          this.answer += data
        }
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      // 处理错误情况...
    });

    this.socket.on('close', () => {
      console.log('WebSocket connection closed');
      // 执行其他操作...
    });
  },
  
  beforeDestroy () {
    if (this.socket) {
      this.socket.disconnect();
    }
  },

  methods:{

    handleKeyDown() {
      let e = window.event || arguments[0];
      if (
        (e.keyCode == 13 || e.key == "Enter" || e.code == "Enter") &&
        e.shiftKey
      ) {
        // 按下 Shift+Enter 键
      } else if (e.keyCode == 13 || e.key == "Enter" || e.code == "Enter") {
        // 按下 Enter 键
        e.returnValue = false; // 阻止默认行为（发送消息）
        this.senWebsocket();
        return false;
      }
    },
    async senWebsocket() {

      console.log("发送")
      if (!this.userInput) {
        this.$message({
          message: "请输入查询信息",
          type: 'warning',
          duration: 1500
        });
        return
      }
      if(this.isResult){
        return
      }

      this.isAsk = true
      this.showSource = false
      this.preLine = 'pre-line';
      this.isResult = true
      this.answer = ""
      this.titles = []
      this.urls = []
      this.isBlink = true
      this.socket.emit('question', this.userInput);

    },
    // async sendMessage() {
    //   console.log("发送")
    //   if (!this.userInput) {
    //     this.$message({
    //       message: "请输入查询信息",
    //       type: 'warning',
    //       duration: 1500
    //     });
    //     return
    //   }
    //   this.isAsk = true
    //   this.loading = true
    //   try {
    //     const response = await axios.post('http://172.16.11.34:5000/api/search',{
    //       query:this.userInput
    //     });
    //     if (response.data.llm_result){
    //       console.log(response.data)
    //       console.log(response.data.llm_result)
          
    //       this.answer = markdown.toHTML(response.data.llm_result)
    //       console.log(this.answer)
    //       const sourceData = response.data.source_data
    //       const parsedData = JSON.parse(sourceData)
    //       const titles = Object.keys(parsedData)
    //         .filter(key => key.startsWith("title"))
    //         .map(key => parsedData[key]);
    //       const urls = Object.keys(parsedData)
    //         .filter(key => key.startsWith("url"))
    //         .map(key => parsedData[key]);
    //       this.titles = titles
    //       this.urls = urls
    //       this.isAsk = true
    //       this.loading = false  // 取消加载
    //     }
    //   } catch (error) {
    //     console.error("访问后台处理出现错误",error)
    //     this.loading = false  // 取消加载
    //     this.$message({
    //       message: "访问后台处理出现错误",
    //       type: 'error',
    //       duration: 1500
    //     });
    //   }
    // }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.blinkCursor {
  display: inline-block;
  width: 0.5em;
  height: 1.5em;
  vertical-align: baseline;
  animation: blink 1s infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
.el-container {
  height: 100%;
}
.content {
  overflow: auto;
  height: 100%;
  margin: 1.25rem 7.5rem;
  /* background-color: #3a4fbc; */
  padding: 0rem 1.25rem;
  border-radius: 1.25rem;
  background-color: rgba(0, 0, 0, 0.05);
}
.el-header {
  background-color: #3a4fbc;
  color: #333;
  text-align: center;
  display: flex;
  flex-direction: column;
  /* line-height: 60px; */
}
.flex-title{
  display: flex;
  flex-direction: row;
  margin: auto;
}

.search{
  color: #8F8FA5; 
  font-size: 1.25rem;
  font-weight:bolder;
  width: 1.5rem;
  /* height: 24px; */
}
.search:hover{
  color: #fff; 
}
.chat-ask-inner {
  /* width: 768px; */
  width: 53.4%;
  margin: 0 auto auto auto;
}
.chat-input {
  position: relative;
  /* background: #40414f;
  border-color: #40414f; */
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.2) 0px 0px 15px 0px;
  border-radius: 4px;
  padding-bottom: 0.3rem;
  padding-top: 0.3rem;
  background-color: white;
  padding-left: 1rem;
}

.chat-submit {
  width: 1.5rem;
  height: 1.5rem;
  position: absolute;
  right: 0.5rem;
  bottom: 0.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
}
.chat-submit:hover {
  background-color:  #85abdf;
}
.chat-submit-img {
  margin-right: 0.125rem;
  margin-bottom: 0.125rem;
}
.el-divider--vertical {
  width: 0.125rem;
  height: 3em;
  margin: 0 1.125rem;
}

.el-link.el-link--success{
  color: #5375d3;
}
.el-link{
  font-size: 1.125rem;
}

.chat-input ::-webkit-scrollbar,
.content ::-webkit-scrollbar{
  width: 8px;
}
.chat-input ::-webkit-scrollbar-thumb,
.content ::-webkit-scrollbar-thumb{
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
.chat-input ::-webkit-scrollbar-track,
.content ::-webkit-scrollbar-track{
    border-radius: 10px;
    background-color: rgb(218, 218, 218);
}.chat-input ::-webkit-scrollbar-thumb:hover,
.content ::-webkit-scrollbar-thumb:hover {
  background-color: #9e9c9c;
}
</style>
<style>
.chat-el-input .el-textarea__inner {
  font-family: Söhne, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
    Ubuntu, Cantarell, Noto Sans, sans-serif, Helvetica Neue, Arial,
    Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji !important;
  /* overflow: hidden !important; */
  resize: none !important;
  max-height: 4.5rem !important;
  /* background: #40414f !important;
  border-color: #40414f !important;
  color: white !important; */
  border: 0;
  margin: 0;
  min-height: 1.5rem !important;
  padding: 0;
  font-variant: tabular-nums;
  list-style: none;
  font-feature-settings: "tnum";
  font-size: 1rem;
}
.el-icon-loading {
  font-size: 3.125rem  !important;
}
.el-loading-spinner .el-loading-text {
  color: #7895e4 !important;
  font-size: 1.25rem  !important;
}
.el-loading-spinner i{
  color: #7895e4  !important;
}
</style>
