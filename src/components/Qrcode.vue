<template>
<div >
    <p>您的乘车码</p>

     <img :src="qrcodeVaule" alt="无数据" />
     <Button type="primary" @click="tohome">返回</Button>
</div>
</template>

<script>
// script 代码
export default {
// other codes
data () {
    return {
      siteName:this.$route.query.siteName,
      siteLat:this.$route.query.siteLat,
      siteLng:this.$route.query.siteLng,
      qrcodeVaule:null,
    }
  },//http://qr.liantu.com/api.php?text=
  mounted: function () {
      var name = this.$route.query.siteName;
      this.qrcodeVaule = "http://qr.liantu.com/api.php?text={siteName:"+name+",siteLat:"+this.siteLat+",siteLng:"+this.siteLng+"}"
      console.log(this.qrcodeVaule);
  },
  methods:{
      tohome(){
          this.$router.push({path: '/'});
      }
  },
}
</script>