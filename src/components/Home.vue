<template>
  <div class="wapper">
    <Row style="background:#36A3F9;">
      <div >
        <div class="city"><span class="from" id="from">{{city}}</span></div>
        <div class="search">
          <Select
                style="display:inherit;"
                v-model="search"
                filterable
                remote
                :remote-method="searchBus"
                :loading="loading1"
                @on-change='change_status()'>
                <Option style="width:260px;" v-for="(option, index) in busList" :value="option" :key="index">
                    {{option.name}}<span style="color:#c1c1c1">({{option.district}})</span>
                </Option>
            </Select>
        </div>
      </div>
    </Row>
    <Row>
      <div class="line_list" >
          <div class="part" v-for="item in items">
            <router-link :to="{ path:'/LineDetails', query: { siteId: item.siteId,  lineName:item.line, siteName: item.site,city:item.cityname,fullname:item.fullname}}">
              <div class="site">
                <span>{{item.site}}</span>
                <span class="sitedistance">{{item.distance}} 米</span>
              </div>
              <div class="tit">
                <span class="name">{{item.line}}</span>
                <span class="distance">距离<strong>{{item.sitenum}}</strong>站</span>
              </div>
              <div class="next_site">下一站：{{item.next_site}}</div>
            </router-link>
          </div>
      </div>
    </Row>
    <Row>
      <div class="column">
        <router-link :to="{path:'/'}">
          <div class="column_item"><img src="../assets/line/bus.png" />
            <br/><span>乘车</span></div>
        </router-link>
        <router-link :to="{ path:'/LineTransfer', query: {fullname:fullname}}">
          <div class=" column_item gray"><img src="../assets/line/line2.png" />
            <br/>路线</div>
        </router-link>
      </div>
    </Row>
    <div class="sm_noneTic" v-bind:class="{ toggle: isShow }">
      <img src="../assets/line/icon-none.png" alt="无数据" />
      <strong>暂无车辆信息</strong>
    </div>
  </div>
</template>


<script>
import AMap from 'AMap'
import Vue from 'Vue'
import axios from 'axios'

export default {
  name: 'FjSite',
  data () {
    return {
      isShow: false,
      items: [],
      busList:[],
      fullname:'',
      search:'',
      loading1: false,
      lineSite: [],
      lineInfos: [],
      city:'',
      currentLocation:{lnc:'',lat:''},
    }
  },
  mounted: function () {
    //this.reload();
    this.init();
  },
  methods: {
    init :function(){
        AMap.service(['AMap.CitySearch'], function () {
        var citySearch = new AMap.CitySearch()
        citySearch.getLocalCity(function (status, result) {
          if (status === 'complete' && result.info === 'OK') {
            console.log(result);
            var cityinfo = result.city;
            var rectangle = result.rectangle;
            this.currentLocation.lnc =rectangle.substring(0,11);
            this.currentLocation.lat =rectangle.substring(12,23);
            this.city = cityinfo.substring(0,cityinfo.length-1);
            //this.city = "济南"
            this.fullname = result.province+result.city;
           //this.fullname = "山东省济南市"
            console.log(this.fullname);
            this.getlocals();
          }
        }.bind(this));
      }.bind(this));
    },
    getlocals:function(){
        AMap.service(["AMap.PlaceSearch"], function() {
            var placeSearch = new AMap.PlaceSearch({ 
                type: '', // 兴趣点类别
                pageSize: 5, // 单页显示结果条数
                pageIndex: 1, // 页码
                city: this.city, // 兴趣点城市
                citylimit: true,  //是否强制限制在设置的城市内搜索
            });
            var cpoint = [this.currentLocation.lnc, this.currentLocation.lat]; //中心点坐标
            placeSearch.searchNearBy('公交站点', cpoint, 200, function(status, result) {
              //console.log(result);
              if (status === 'complete' && result.info === 'OK') {
              //  console.log(result);
                var pois = result.poiList.pois
                var random = [4, 4, 24, 14]
                pois.forEach((item, index) => {
                  
                  this.items.push({
                    site: item.name.substr(0, item.name.indexOf('(')),
                    line: item.address,
                    distance: item.distance,
                    next_site: '',
                    sitenum: random[index],
                    siteId: item.id,
                    cityname: this.city,
                    fullname: this.fullname
                  })
                  console.log(this.items);
                  this.lineInfo(item.address.substr(0, item.address.length - 1), item.id, index)
                })
              }
            }.bind(this));
        }.bind(this));
    },
    lineInfo: function (linename, id, index) {
      //console.log(linename, index)
      AMap.service(['AMap.LineSearch'], function () {
        var linesearch = new AMap.LineSearch({
          pageIndex: 1,
          city: this.city,
          pageSize: 20,
          extensions: 'all' // 返回全部信息
        })
        linesearch.search(linename, function (status, result) {
              // 取回公交路线查询结果
          if (status === 'complete' && result.info === 'OK') {
            var tips = result.lineInfo[0]
            var num = ''
            this.isShow = true
            //console.log('posi:', tips, id, index)
            Vue.set(this.lineInfos, index, tips)
            Vue.set(this.lineSite, index, tips.via_stops)
            Vue.set(this.items[index], 'lineId', tips.id)
            if (tips.id !== '' && undefined !== tips.id) {
              for (let j = 0; j < tips.via_stops.length; j++) {
                if (tips.via_stops[j].id === id) {
                  num = j + 1
                  break
                }
              }
              if (num !== tips.via_stops.length) {
               // console.log('下一站：', num)
                Vue.set(this.items[index], 'next_site', tips.via_stops[num].name)
              } else {
                Vue.set(this.items[index], 'next_site', '当前站为终点站')
              }
            }
          } else {
            this.isShow = true
          }
        }.bind(this))
      }.bind(this, linename, id, index))
    },
    searchBus:function(query){
      console.log(query);
      var autoOptions = {
        datatype:"busline",
        city:this.city
      }
      var autoComplete= new AMap.Autocomplete(autoOptions);
      autoComplete.search(query, function(status, result) {
           this.busList = result.tips;
           console.log( this.busList );
        }.bind(this))
      },
     change_status:function(){
       var ss = this.search;
        console.log(ss);
        this.$router.push({path: '/LineDetails',query:{ lineName:ss.name,city:this.city,status:1,fullname:this.fullname}});
     },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*新搜索框*/
.toggle{
  display: none;
}
.pop_list_title {
  width: 100%;
  height: 0.88rem;
  padding: 0.14rem 0.2rem;
  background: #36A3F9;
  overflow: hidden;
  position: fixed;
  left: 0;
  top: 0;
}

.pop_list_title .closespan {
  float: right;
  display: block;
  width: 0.9rem;
  height: 0.6rem;
  line-height: 0.6rem;
  font-size: 0.32rem;
  color: #fff;
 
}

.pop_list_title .input_area {
  float: left;
  width: 70%;
  padding: 0.12rem;
  height: 0.6rem;
  background: #5DB4F9;
  margin-left: 0.1rem;
  border-radius: 0.16rem;
}

.pop_list_title .input_area input::-webkit-input-placeholder {
  color: #fff;
}

.pop_list_title .input_area input {
  font-size: 0.28rem;
  color: #fff;
  display: block;
  width: 90%;
  padding-left: 0.52rem;
  height: 0.36rem;
  line-height: 0.36rem;
  background: url(../assets/line/search2.png) no-repeat left center;
  background-size: 0.36rem 0.36rem;
  border: none;
}
.line_list{
}
.line_list .part{
  background: #fff;
  color:#292A2C;
  font-size: 0.32rem;
  height:2.2rem;
  width:100%;
  margin-bottom: 0.2rem;
  padding:0.3rem;
  text-align:left;
}
.line_list .site{
  padding-left: 0.52rem;
  margin-bottom: 0.2rem;
    background:url(../assets/line/position.png) left no-repeat;
    background-size:0.36rem; 
}
.line_list .tit{
  height: 0.42rem;
  margin-bottom: 0.2rem;
}
.line_list .name{
  padding-left: 0.52rem;
  float: left;
  background:url(../assets/line/car.png) left no-repeat;
    background-size:0.36rem 0.36rem; 
}
.line_list .distance{
  float: right;
  color:#9A9DA0;
  margin-right: 0.35rem;
}
.line_list .sitedistance{
  float: right;
  margin-right: 0.35rem;
}
.line_list .distance strong{
  font-size: 0.28rem;
  color:#292A2C;
  margin:0 0.2rem;
}
.line_list .next_site{
  padding-left:0.56rem;
  color:#9A9DA0;
  font-size: 0.28rem;
}

.city{
  width: 20%;
  float: left;
  font-size:15px;
  padding-top: 15px;
  padding-bottom: 10px;
}
.search{
  width: 75%;
  padding-top: 11px;
  height: 50px;
  float: left;
}
.from {
  padding-left: 0.52rem;
  background: url(../assets/line/position2.png) no-repeat left;
  background-size: 0.28rem 0.32rem;
}

</style>
